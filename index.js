require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { initDB } = require('./config/db');

// Import Route Handlers
const authRoutes = require('./routes/auth.routes');
const documentRoutes = require('./routes/document.routes');
const analysisRoutes = require('./routes/analysis.routes');
const chatRoutes = require('./routes/chat.routes');
const mindmapRoutes = require('./routes/mindmap.routes');
const studyRoutes = require('./routes/study.routes');
const exportRoutes = require('./routes/export.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body Parsers
app.use(express.json({ limit: '60mb' }));
app.use(express.urlencoded({ extended: true, limit: '60mb' }));

// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again in 15 minutes.'
  }
});
app.use('/api', apiLimiter);

// Serve static exports
app.use('/static/exports', express.static(path.join(__dirname, '../exports')));

// Health & System Info
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'NEXORA AI',
    tagline: 'Turn Documents Into Knowledge.',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/mindmaps', mindmapRoutes);
app.use('/api/study', studyRoutes);
app.use('/api/exports', exportRoutes);
app.use('/api/admin', adminRoutes);

// Serve Frontend build if available
const clientDistPath = path.join(__dirname, '../../client/dist');
const fs = require('fs');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api') || req.originalUrl.startsWith('/static')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// 404 Handler for API routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.originalUrl} not found on Nexora AI API.`
  });
});

// Global Error Handler (friendly error messages, never leak stack traces)
app.use((err, req, res, next) => {
  console.error('Server Unhandled Error:', err.message);

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File too large. Maximum file upload limit is 50MB.'
    });
  }

  res.status(500).json({
    success: false,
    message: err.message || 'An internal error occurred on Nexora AI server. Please try again.'
  });
});

// Start Server
async function startServer() {
  await initDB();
  app.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(`🚀 NEXORA AI Server running on http://localhost:${PORT}`);
    console.log(`Tagline: "Turn Documents Into Knowledge."`);
    console.log(`Admin Portal: http://localhost:${PORT}/api/admin`);
    console.log(`==================================================`);
  });
}

startServer();
