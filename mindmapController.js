const MindMap = require('../models/MindMap');
const Document = require('../models/Document');
const mindMapGenerator = require('../services/mindMapGenerator');
const { logActivity } = require('../middleware/activityLogger');

const getOrGenerateMindMap = async (req, res) => {
  try {
    const { documentId } = req.params;
    const { type = 'mindmap', regenerate = false } = req.query;
    const userId = req.user.id;

    const doc = Document.findById(documentId);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found.' });
    }

    if (doc.ownerId !== userId && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    // Check if mind map for this specific type exists
    let existing = MindMap.findOne({ documentId, ownerId: userId, visualizationType: type });
    if (existing && !regenerate) {
      return res.json({ success: true, mindMap: existing });
    }

    // Generate graph
    const graphData = await mindMapGenerator.generateKnowledgeGraph(doc, type);

    let saved;
    if (existing) {
      saved = MindMap.findByIdAndUpdate(existing._id, {
        mainTopic: graphData.mainTopic,
        nodes: graphData.nodes,
        edges: graphData.edges,
        visualizationType: type,
        updatedAt: new Date().toISOString()
      });
    } else {
      saved = MindMap.create({
        ownerId: userId,
        documentId,
        visualizationType: type,
        mainTopic: graphData.mainTopic,
        nodes: graphData.nodes,
        edges: graphData.edges
      });
    }

    logActivity(userId, 'CREATE_MINDMAP', 'SUCCESS', { documentId, type }, req.ip);

    return res.json({ success: true, mindMap: saved });
  } catch (err) {
    console.error('Mind map error:', err);
    return res.status(500).json({ success: false, message: 'Failed to generate visual mind map.' });
  }
};

const updateMindMap = async (req, res) => {
  try {
    const { id } = req.params;
    const { nodes, edges } = req.body;
    const userId = req.user.id;

    const map = MindMap.findById(id);
    if (!map || (map.ownerId !== userId && req.user.role !== 'SUPER_ADMIN')) {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    const updated = MindMap.findByIdAndUpdate(id, {
      nodes: nodes || map.nodes,
      edges: edges || map.edges,
      updatedAt: new Date().toISOString()
    });

    return res.json({ success: true, mindMap: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update mind map.' });
  }
};

const getMindMaps = async (req, res) => {
  try {
    const userId = req.user.id;
    const maps = MindMap.find({ ownerId: userId }).sort({ updatedAt: -1 }).exec();
    return res.json({ success: true, mindMaps: maps });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch mind maps.' });
  }
};

module.exports = {
  getOrGenerateMindMap,
  updateMindMap,
  getMindMaps
};
