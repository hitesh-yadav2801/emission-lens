/**
 * Emission Lens API Server
 * Express server providing emissions data from Climate TRACE API
 */

import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import emissionsRouter from './routes/emissions.js';
import chatRouter from './routes/chat.js';
import searchRouter from './routes/search.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';
import { initializeCountryNames } from './services/emissionsApi.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware - Configure CORS for production
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    /\.vercel\.app$/,
    /\.onrender\.com$/
  ],
  credentials: true
}));
app.use(express.json());

// API Routes
app.use('/api/emissions', emissionsRouter);
app.use('/api/chat', chatRouter);
app.use('/api/search', searchRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static files in production (only if client/dist exists)
const clientDistPath = path.join(__dirname, '../client/dist');
if (process.env.NODE_ENV === 'production' && existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Start server and initialize data
async function startServer() {
  try {
    console.log('🔄 Initializing country name cache...');
    await initializeCountryNames();
    console.log('✅ Server initialization complete');
  } catch (error) {
    console.warn('⚠️ Country name cache unavailable:', error.message);
  }
  
  app.listen(PORT, () => {
    console.log(`🚀 Emission Lens API running on port ${PORT}`);
    console.log(`📊 API endpoints: http://localhost:${PORT}/api`);
  });
}

startServer();
