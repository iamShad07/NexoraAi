const Document = require('../models/Document');
const Analysis = require('../models/Analysis');
const aiProvider = require('../services/aiProvider');
const ragService = require('../services/ragService');
const { logActivity } = require('../middleware/activityLogger');

const getOrGenerateAnalysis = async (req, res) => {
  try {
    const { documentId } = req.params;
    const userId = req.user.id;

    const doc = Document.findById(documentId);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found.' });
    }

    if (doc.ownerId !== userId && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ success: false, message: 'Unauthorized access to document analysis.' });
    }

    // Check if analysis already cached
    let existingAnalysis = Analysis.findOne({ documentId, ownerId: userId });
    if (existingAnalysis) {
      return res.json({ success: true, analysis: existingAnalysis });
    }

    // Generate fresh analysis
    const analysisData = await aiProvider.analyzeDocument(doc);
    const saved = Analysis.create({
      ownerId: userId,
      documentId,
      ...analysisData
    });

    logActivity(userId, 'GENERATE_ANALYSIS', 'SUCCESS', { documentId }, req.ip);

    return res.json({ success: true, analysis: saved });
  } catch (err) {
    console.error('Analysis controller error:', err);
    return res.status(500).json({ success: false, message: 'We couldn\'t complete the analysis. Please try again.' });
  }
};

const explainSimply = async (req, res) => {
  try {
    const { documentId } = req.params;
    const { level = 'Normal', language = 'English', customText } = req.body;
    const userId = req.user.id;

    const doc = Document.findById(documentId);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found.' });
    }

    if (doc.ownerId !== userId && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    const targetText = customText || doc.textContent.slice(0, 1500);
    const explanation = await aiProvider.explainSimply(targetText, level, language);

    return res.json({
      success: true,
      explanation,
      level,
      language
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to generate simplified explanation.' });
  }
};

const compareDocuments = async (req, res) => {
  try {
    const { documentIds } = req.body;
    const userId = req.user.id;

    if (!documentIds || !Array.isArray(documentIds) || documentIds.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Please select at least two documents to compare.'
      });
    }

    // Verify user owns all requested documents
    for (const id of documentIds) {
      const doc = Document.findById(id);
      if (!doc || (doc.ownerId !== userId && req.user.role !== 'SUPER_ADMIN')) {
        return res.status(403).json({
          success: false,
          message: 'One or more selected documents do not belong to your account.'
        });
      }
    }

    const comparisonResult = await ragService.compareDocuments(documentIds);

    logActivity(userId, 'COMPARE_DOCUMENTS', 'SUCCESS', { count: documentIds.length }, req.ip);

    return res.json({
      success: true,
      comparison: comparisonResult
    });
  } catch (err) {
    console.error('Comparison error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Comparison failed.' });
  }
};

module.exports = {
  getOrGenerateAnalysis,
  explainSimply,
  compareDocuments
};
