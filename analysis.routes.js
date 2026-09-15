const express = require('express');
const router = express.Router();
const analysisController = require('../controllers/analysisController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/:documentId', analysisController.getOrGenerateAnalysis);
router.post('/:documentId', analysisController.getOrGenerateAnalysis);
router.post('/:documentId/explain', analysisController.explainSimply);
router.post('/compare', analysisController.compareDocuments);

module.exports = router;
