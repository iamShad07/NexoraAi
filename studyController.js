const StudyMaterial = require('../models/StudyMaterial');
const Document = require('../models/Document');
const studyGenerator = require('../services/studyGenerator');
const { logActivity } = require('../middleware/activityLogger');

const getOrGenerateStudyKit = async (req, res) => {
  try {
    const { documentId } = req.params;
    const { regenerate = false } = req.query;
    const userId = req.user.id;

    const doc = Document.findById(documentId);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found.' });
    }

    if (doc.ownerId !== userId && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    let existing = StudyMaterial.findOne({ documentId, ownerId: userId });
    if (existing && !regenerate) {
      return res.json({ success: true, studyKit: existing });
    }

    const kitData = await studyGenerator.generateStudyKit(doc);

    let saved;
    if (existing) {
      saved = StudyMaterial.findByIdAndUpdate(existing._id, {
        ...kitData,
        updatedAt: new Date().toISOString()
      });
    } else {
      saved = StudyMaterial.create({
        ownerId: userId,
        documentId,
        ...kitData
      });
    }

    logActivity(userId, 'STUDY_MODE', 'SUCCESS', { documentId }, req.ip);

    return res.json({ success: true, studyKit: saved });
  } catch (err) {
    console.error('Study mode error:', err);
    return res.status(500).json({ success: false, message: 'Failed to generate study materials.' });
  }
};

const getStudyMaterials = async (req, res) => {
  try {
    const userId = req.user.id;
    const materials = StudyMaterial.find({ ownerId: userId }).sort({ updatedAt: -1 }).exec();
    return res.json({ success: true, studyMaterials: materials });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch study materials.' });
  }
};

module.exports = {
  getOrGenerateStudyKit,
  getStudyMaterials
};
