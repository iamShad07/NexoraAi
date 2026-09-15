const fs = require('fs');
const path = require('path');
const Document = require('../models/Document');
const Analysis = require('../models/Analysis');
const MindMap = require('../models/MindMap');
const StudyMaterial = require('../models/StudyMaterial');
const Chat = require('../models/Chat');
const documentProcessor = require('../services/documentProcessor');
const aiProvider = require('../services/aiProvider');
const mindMapGenerator = require('../services/mindMapGenerator');
const studyGenerator = require('../services/studyGenerator');
const { logActivity } = require('../middleware/activityLogger');

const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Upload failed. Please choose a file and try again.' });
    }

    const { originalname, mimetype, size, path: tempPath } = req.file;
    const userId = req.user.id;

    // Execute Document Processing Pipeline
    const processed = await documentProcessor.processFile(tempPath, mimetype, originalname);

    // Create Document record scoped to this user
    const newDoc = Document.create({
      ownerId: userId,
      originalName: originalname,
      mimeType: mimetype,
      size,
      filePath: tempPath,
      textContent: processed.textContent,
      pageCount: processed.pageCount,
      wordCount: processed.wordCount,
      charCount: processed.charCount,
      structureType: processed.structureType,
      chunks: processed.chunks,
      status: 'ready'
    });

    logActivity(userId, 'UPLOAD_DOCUMENT', 'SUCCESS', {
      documentId: newDoc._id,
      name: originalname,
      size,
      structureType: processed.structureType
    }, req.ip);

    // Automatically trigger background pre-analysis and initial mind map generation so the UI is instantaneous!
    setTimeout(async () => {
      try {
        const analysisData = await aiProvider.analyzeDocument(newDoc);
        Analysis.create({
          ownerId: userId,
          documentId: newDoc._id,
          ...analysisData
        });

        const initialGraph = await mindMapGenerator.generateKnowledgeGraph(newDoc, 'mindmap');
        MindMap.create({
          ownerId: userId,
          documentId: newDoc._id,
          visualizationType: 'mindmap',
          mainTopic: initialGraph.mainTopic,
          nodes: initialGraph.nodes,
          edges: initialGraph.edges
        });

        const initialStudy = await studyGenerator.generateStudyKit(newDoc);
        StudyMaterial.create({
          ownerId: userId,
          documentId: newDoc._id,
          ...initialStudy
        });
      } catch (bgErr) {
        console.warn('Background auto-indexing note:', bgErr.message);
      }
    }, 50);

    return res.status(201).json({
      success: true,
      message: 'Document uploaded and analyzed successfully.',
      document: {
        id: newDoc._id || newDoc.id,
        originalName: newDoc.originalName,
        mimeType: newDoc.mimeType,
        size: newDoc.size,
        pageCount: newDoc.pageCount,
        wordCount: newDoc.wordCount,
        structureType: newDoc.structureType,
        createdAt: newDoc.createdAt,
        status: newDoc.status
      }
    });
  } catch (err) {
    console.error('Upload processing error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Upload failed. Please check the file and try again.'
    });
  }
};

const getDocuments = async (req, res) => {
  try {
    const userId = req.user.id;
    // Strict user isolation
    const docs = Document.find({ ownerId: userId }).sort({ createdAt: -1 }).exec();

    // Sanitize output (don't send full text in listing)
    const sanitized = docs.map(d => ({
      id: d._id || d.id,
      originalName: d.originalName,
      mimeType: d.mimeType,
      size: d.size,
      pageCount: d.pageCount,
      wordCount: d.wordCount,
      structureType: d.structureType,
      createdAt: d.createdAt,
      status: d.status
    }));

    return res.json({ success: true, documents: sanitized });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve documents.' });
  }
};

const getDocumentById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const doc = Document.findById(id);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found.' });
    }

    // Ownership check (or Super Admin)
    if (doc.ownerId !== userId && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ success: false, message: 'You don\'t have permission to access this resource.' });
    }

    return res.json({
      success: true,
      document: {
        id: doc._id || doc.id,
        originalName: doc.originalName,
        mimeType: doc.mimeType,
        size: doc.size,
        pageCount: doc.pageCount,
        wordCount: doc.wordCount,
        charCount: doc.charCount,
        structureType: doc.structureType,
        chunks: doc.chunks,
        createdAt: doc.createdAt,
        status: doc.status
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch document.' });
  }
};

const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const doc = Document.findById(id);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found.' });
    }

    if (doc.ownerId !== userId && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ success: false, message: 'You don\'t have permission to delete this resource.' });
    }

    // 1. Delete physical file if exists
    if (doc.filePath && fs.existsSync(doc.filePath)) {
      try {
        fs.unlinkSync(doc.filePath);
      } catch (fErr) {
        console.warn('Physical file deletion warning:', fErr.message);
      }
    }

    // 2. Cascade delete all associated user entities
    Document.findByIdAndDelete(id);
    Analysis.deleteMany({ documentId: id });
    MindMap.deleteMany({ documentId: id });
    StudyMaterial.deleteMany({ documentId: id });

    logActivity(userId, 'DELETE_DOCUMENT', 'SUCCESS', { documentId: id, name: doc.originalName }, req.ip);

    return res.json({ success: true, message: 'Document and all associated knowledge records deleted.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete document.' });
  }
};

module.exports = {
  uploadDocument,
  getDocuments,
  getDocumentById,
  deleteDocument
};
