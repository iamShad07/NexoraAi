const express = require('express');
const router = express.Router();
const mindmapController = require('../controllers/mindmapController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', mindmapController.getMindMaps);
router.get('/:documentId', mindmapController.getOrGenerateMindMap);
router.post('/:documentId', mindmapController.getOrGenerateMindMap);
router.put('/:id', mindmapController.updateMindMap);

module.exports = router;
