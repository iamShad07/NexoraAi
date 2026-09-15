const express = require('express');
const router = express.Router();
const studyController = require('../controllers/studyController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', studyController.getStudyMaterials);
router.get('/:documentId', studyController.getOrGenerateStudyKit);
router.post('/:documentId/generate', studyController.getOrGenerateStudyKit);

module.exports = router;
