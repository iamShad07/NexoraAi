const Chat = require('../models/Chat');
const Document = require('../models/Document');
const ragService = require('../services/ragService');
const { logActivity } = require('../middleware/activityLogger');
const { v4: uuidv4 } = require('uuid');

const getOrCreateChat = async (req, res) => {
  try {
    const { documentId, documentIds } = req.body;
    const userId = req.user.id;

    const targetDocIds = documentIds || (documentId ? [documentId] : []);

    // Check if user owns these documents
    for (const dId of targetDocIds) {
      const doc = Document.findById(dId);
      if (!doc || (doc.ownerId !== userId && req.user.role !== 'SUPER_ADMIN')) {
        return res.status(403).json({ success: false, message: 'Unauthorized document access.' });
      }
    }

    // Check if there is an existing chat with these docIds
    const existing = Chat.findOne({
      ownerId: userId,
      documentId: targetDocIds[0]
    });

    if (existing) {
      return res.json({ success: true, chat: existing });
    }

    const docName = targetDocIds.length > 0 ? (Document.findById(targetDocIds[0])?.originalName || 'Document') : 'General Document';
    const newChat = Chat.create({
      ownerId: userId,
      documentId: targetDocIds[0] || null,
      documentIds: targetDocIds,
      title: `Chat: ${docName}`,
      messages: [
        {
          id: uuidv4(),
          role: 'assistant',
          content: `Hello! I am your Nexora AI intelligence assistant. I have indexed your document with source grounding. You can ask me questions like:
- "What is this document about?"
- "Explain the core points."
- "What are the important exam or business takeaways?"
- "Where is this information mentioned?"`,
          sources: [],
          timestamp: new Date().toISOString()
        }
      ]
    });

    return res.json({ success: true, chat: newChat });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to initiate chat.' });
  }
};

const getChats = async (req, res) => {
  try {
    const userId = req.user.id;
    const chats = Chat.find({ ownerId: userId }).sort({ updatedAt: -1 }).exec();
    return res.json({ success: true, chats });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load chats.' });
  }
};

const getChatById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const chat = Chat.findById(id);
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat session not found.' });
    }

    if (chat.ownerId !== userId && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    return res.json({ success: true, chat });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch chat.' });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const userId = req.user.id;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message cannot be empty.' });
    }

    const chat = Chat.findById(id);
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found.' });
    }

    if (chat.ownerId !== userId && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    const docIds = chat.documentIds && chat.documentIds.length > 0 ? chat.documentIds : (chat.documentId ? [chat.documentId] : []);

    // 1. Add user message
    const userMsg = {
      id: uuidv4(),
      role: 'user',
      content: message.trim(),
      timestamp: new Date().toISOString()
    };

    // 2. Query RAG engine
    const ragResult = await ragService.answerQuestion(docIds, message, chat.messages);

    // 3. Add assistant message with grounded sources
    const assistantMsg = {
      id: uuidv4(),
      role: 'assistant',
      content: ragResult.answer,
      sources: ragResult.sources || [],
      provider: ragResult.provider,
      timestamp: new Date().toISOString()
    };

    const updatedMessages = [...(chat.messages || []), userMsg, assistantMsg];

    const updatedChat = Chat.findByIdAndUpdate(id, {
      messages: updatedMessages,
      lastMessage: assistantMsg.content.slice(0, 100),
      updatedAt: new Date().toISOString()
    });

    logActivity(userId, 'CHAT_QUERY', 'SUCCESS', { chatId: id, query: message.slice(0, 80) }, req.ip);

    return res.json({
      success: true,
      userMessage: userMsg,
      assistantMessage: assistantMsg,
      chat: updatedChat
    });
  } catch (err) {
    console.error('Chat error:', err);
    return res.status(500).json({ success: false, message: 'We couldn\'t generate an answer. Please try again.' });
  }
};

const deleteChat = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const chat = Chat.findById(id);
    if (!chat || (chat.ownerId !== userId && req.user.role !== 'SUPER_ADMIN')) {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    Chat.findByIdAndDelete(id);
    return res.json({ success: true, message: 'Chat deleted.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete chat.' });
  }
};

module.exports = {
  getOrCreateChat,
  getChats,
  getChatById,
  sendMessage,
  deleteChat
};
