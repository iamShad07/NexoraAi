const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Document = require('../models/Document');
const Analysis = require('../models/Analysis');
const MindMap = require('../models/MindMap');
const Export = require('../models/Export');
const ActivityLog = require('../models/ActivityLog');
const AdminPermission = require('../models/AdminPermission');
const SystemSetting = require('../models/SystemSetting');
const { JWT_SECRET } = require('../middleware/auth');
const { logActivity } = require('../middleware/activityLogger');
const { v4: uuidv4 } = require('uuid');

const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const user = User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials.' });
    }

    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      logActivity(user._id, 'ADMIN_LOGIN_DENIED', 'FAILED', { reason: 'Unauthorized role attempt' }, req.ip);
      return res.status(403).json({
        success: false,
        message: '403 Forbidden: Standard users cannot access administrative endpoints.'
      });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ success: false, message: 'Your administrator account has been suspended.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logActivity(user._id, 'ADMIN_LOGIN', 'FAILED', { reason: 'Incorrect password' }, req.ip);
      return res.status(401).json({ success: false, message: 'Invalid admin credentials.' });
    }

    // Retrieve granular permissions if ADMIN
    let permissions = ['*'];
    if (user.role === 'ADMIN') {
      const permRecord = AdminPermission.findOne({ userId: user._id });
      permissions = permRecord ? permRecord.permissions : ['VIEW_USERS', 'VIEW_DOCUMENTS', 'VIEW_ANALYTICS'];
    }

    const token = jwt.sign(
      { id: user._id || user.id, role: user.role, permissions },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    logActivity(user._id, 'ADMIN_LOGIN', 'SUCCESS', { role: user.role }, req.ip);

    return res.json({
      success: true,
      message: 'Admin authentication successful. Welcome to Nexora AI Admin Portal.',
      token,
      admin: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions,
        avatar: user.avatar
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Admin login error.' });
  }
};

const getAnalytics = async (req, res) => {
  try {
    const totalUsers = User.countDocuments();
    const activeUsers = User.countDocuments({ status: 'active' });
    const totalDocuments = Document.countDocuments();
    const totalAnalyses = Analysis.countDocuments();
    const totalMindMaps = MindMap.countDocuments();
    const totalExports = Export.countDocuments();

    // Calculate storage usage
    const allDocs = Document.find({}).exec();
    const totalBytes = allDocs.reduce((acc, d) => acc + (d.size || 0), 0);
    const storageMB = (totalBytes / (1024 * 1024)).toFixed(2);

    // AI Usage estimates
    const aiQueriesCount = ActivityLog.countDocuments({ action: 'CHAT_QUERY' }) + totalAnalyses;
    const estimatedTokens = aiQueriesCount * 480;
    const estimatedCostUSD = (estimatedTokens * 0.000002).toFixed(4);

    // Recent activity
    const recentLogs = ActivityLog.find({}).sort({ timestamp: -1 }).limit(10).exec();

    // Chart analytics (document types breakdown)
    const typeCounts = {
      pdf: 0,
      docx: 0,
      sheets: 0,
      images: 0,
      other: 0
    };

    allDocs.forEach(d => {
      const mime = (d.mimeType || '').toLowerCase();
      if (mime.includes('pdf')) typeCounts.pdf++;
      else if (mime.includes('word') || mime.includes('document')) typeCounts.docx++;
      else if (mime.includes('sheet') || mime.includes('csv') || mime.includes('excel')) typeCounts.sheets++;
      else if (mime.includes('image')) typeCounts.images++;
      else typeCounts.other++;
    });

    return res.json({
      success: true,
      metrics: {
        totalUsers,
        activeUsers,
        newRegistrationsToday: Math.min(totalUsers, 4),
        totalDocuments,
        totalAnalyses,
        totalMindMaps,
        totalExports,
        storageUsageMB: storageMB,
        aiRequests: aiQueriesCount,
        estimatedTokens,
        estimatedCostUSD,
        failedRequests: ActivityLog.countDocuments({ status: 'FAILED' })
      },
      documentTypes: typeCounts,
      recentActivity: recentLogs
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch analytics.' });
  }
};

const getUsers = async (req, res) => {
  try {
    const { search, role, status } = req.query;
    let users = User.find({}).sort({ createdAt: -1 }).exec();

    if (search) {
      const q = search.toLowerCase();
      users = users.filter(u => u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.phone?.includes(q));
    }

    if (role) {
      users = users.filter(u => u.role === role);
    }

    if (status) {
      users = users.filter(u => u.status === status);
    }

    // Never leak passwords!
    const sanitized = users.map(u => ({
      id: u._id || u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      role: u.role,
      status: u.status,
      avatar: u.avatar,
      createdAt: u.createdAt,
      documentCount: Document.countDocuments({ ownerId: u._id || u.id })
    }));

    return res.json({ success: true, users: sanitized });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve users.' });
  }
};

const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, role } = req.body;

    const user = User.findById(id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    // Protect Super Admin from being altered by non-super admin
    if (user.role === 'SUPER_ADMIN' && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ success: false, message: 'Cannot modify Super Admin.' });
    }

    const updates = {};
    if (status) updates.status = status;
    if (role && req.user.role === 'SUPER_ADMIN') updates.role = role;

    const updated = User.findByIdAndUpdate(id, updates);

    logActivity(req.user.id, 'UPDATE_USER_STATUS', 'SUCCESS', { targetUserId: id, updates }, req.ip);

    return res.json({
      success: true,
      message: 'User updated successfully.',
      user: {
        id: updated._id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
        status: updated.status
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Update failed.' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = User.findById(id);

    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    if (user.role === 'SUPER_ADMIN') {
      return res.status(403).json({ success: false, message: 'Cannot delete Super Admin.' });
    }

    User.findByIdAndDelete(id);
    Document.deleteMany({ ownerId: id });
    Analysis.deleteMany({ ownerId: id });
    MindMap.deleteMany({ ownerId: id });

    logActivity(req.user.id, 'DELETE_USER', 'SUCCESS', { targetUserId: id }, req.ip);

    return res.json({ success: true, message: 'User and all data deleted.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Delete failed.' });
  }
};

const getAdminDocuments = async (req, res) => {
  try {
    const docs = Document.find({}).sort({ createdAt: -1 }).exec();

    // Respect privacy: Only metadata is exposed to admins
    const sanitized = docs.map(d => {
      const owner = User.findById(d.ownerId);
      return {
        id: d._id || d.id,
        originalName: d.originalName,
        mimeType: d.mimeType,
        size: d.size,
        pageCount: d.pageCount,
        wordCount: d.wordCount,
        structureType: d.structureType,
        status: d.status,
        createdAt: d.createdAt,
        ownerName: owner ? owner.name : 'Unknown User',
        ownerEmail: owner ? owner.email : 'Unknown'
      };
    });

    return res.json({ success: true, documents: sanitized });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch documents.' });
  }
};

const deleteAdminDocument = async (req, res) => {
  try {
    const { id } = req.params;
    Document.findByIdAndDelete(id);
    Analysis.deleteMany({ documentId: id });
    MindMap.deleteMany({ documentId: id });

    logActivity(req.user.id, 'ADMIN_DELETE_DOCUMENT', 'SUCCESS', { documentId: id }, req.ip);

    return res.json({ success: true, message: 'Problematic document removed from system.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete document.' });
  }
};

const getActivityLogs = async (req, res) => {
  try {
    const logs = ActivityLog.find({}).sort({ timestamp: -1 }).limit(100).exec();
    return res.json({ success: true, logs });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch logs.' });
  }
};

const createAdminAccount = async (req, res) => {
  try {
    const { name, email, password, permissions } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields required.' });
    }

    const existing = User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const adminId = uuidv4();

    const newAdmin = User.create({
      _id: adminId,
      id: adminId,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: passwordHash,
      role: 'ADMIN',
      status: 'active',
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`
    });

    AdminPermission.create({
      userId: adminId,
      permissions: permissions || ['VIEW_USERS', 'VIEW_DOCUMENTS', 'VIEW_ANALYTICS'],
      assignedBy: req.user.id
    });

    logActivity(req.user.id, 'CREATE_ADMIN', 'SUCCESS', { newAdminId: adminId, email }, req.ip);

    return res.status(201).json({
      success: true,
      message: 'Admin account created successfully.',
      admin: {
        id: newAdmin._id,
        name: newAdmin.name,
        email: newAdmin.email,
        role: newAdmin.role
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to create admin.' });
  }
};

const getSystemSettings = async (req, res) => {
  try {
    let settings = SystemSetting.findOne({ key: 'general' });
    if (!settings) {
      settings = {
        platformName: 'Nexora AI',
        tagline: 'Turn Documents Into Knowledge.',
        allowRegistrations: true,
        maxFileSizeMB: 50,
        defaultAiProvider: 'gemini'
      };
    }
    return res.json({ success: true, settings });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to get settings.' });
  }
};

const updateSystemSettings = async (req, res) => {
  try {
    const { platformName, allowRegistrations, maxFileSizeMB, defaultAiProvider } = req.body;
    let settings = SystemSetting.findOne({ key: 'general' });
    if (settings) {
      settings = SystemSetting.findByIdAndUpdate(settings._id, {
        platformName: platformName || settings.platformName,
        allowRegistrations: allowRegistrations !== undefined ? allowRegistrations : settings.allowRegistrations,
        maxFileSizeMB: maxFileSizeMB || settings.maxFileSizeMB,
        defaultAiProvider: defaultAiProvider || settings.defaultAiProvider
      });
    }

    logActivity(req.user.id, 'UPDATE_SETTINGS', 'SUCCESS', req.body, req.ip);

    return res.json({ success: true, message: 'System settings updated.', settings });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update settings.' });
  }
};

module.exports = {
  adminLogin,
  getAnalytics,
  getUsers,
  updateUserStatus,
  deleteUser,
  getAdminDocuments,
  deleteAdminDocument,
  getActivityLogs,
  createAdminAccount,
  getSystemSettings,
  updateSystemSettings
};
