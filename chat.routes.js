const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.post('/', chatController.getOrCreateChat);
router.get('/', chatController.getChats);
router.get('/:id', chatController.getChatById);
router.post('/:id/message', chatController.sendMessage);
router.delete('/:id', chatController.deleteChat);

module.exports = router;
