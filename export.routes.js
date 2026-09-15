const express = require('express');
const router = express.Router();
const exportController = require('../controllers/exportController');
const { authenticateToken } = require('../middleware/auth');

router.get('/download/:id', exportController.downloadExportFile);

router.use(authenticateToken);

router.post('/generate', exportController.generateExport);
router.get('/', exportController.getExports);

module.exports = router;
