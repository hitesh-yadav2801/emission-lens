/**
 * Chat API Route
 * AI-powered chat endpoint for emissions data analysis
 * Uses modular AI service architecture for provider flexibility
 */

import express from 'express';
import AIService from '../services/ai/index.js';
import { getCountryEmissions, getRegionalEmissions } from '../services/emissionsApi.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const chatRouter = express.Router();

// Initialize AI Service (can be switched to other providers)
// Available providers: 'openai' (more can be added)
const AI_PROVIDER = process.env.AI_PROVIDER || 'openai';
const AI_MODEL = process.env.AI_MODEL || 'gpt-4o-mini';

const aiService = new AIService(AI_PROVIDER, { model: AI_MODEL });

/**
 * Loads the system prompt template from file
 */
function loadPromptTemplate() {
  try {
    const promptPath = join(__dirname, '../prompts/emissions-analyst.txt');
    return readFileSync(promptPath, 'utf-8');
  } catch (error) {
    console.error('Failed to load prompt template:', error.message);
    return `You are an environmental analyst assistant. Only answer questions about emissions and environment. 
    If asked about anything else, politely decline and ask the user to focus on environmental topics.`;
  }
}

/**
 * Builds dynamic data context from Climate TRACE API
 */
async function buildDataContext() {
  try {
    const data = await getCountryEmissions({ since: 2023, to: 2023 });
    const regionalData = await getRegionalEmissions({ since: 2023, to: 2023 });
    const topCountries = data.topCountries.slice(0, 10);
    
    return `
=== LIVE DATA FROM CLIMATE TRACE API ===
Data Year: ${data.year} | Last Updated: ${data.lastUpdated}

GLOBAL TOTAL: ${data.worldTotals.co2.toLocaleString()} Million Tonnes CO2
Countries Tracked: ${data.countries.length}

TOP 10 EMITTING COUNTRIES:
${topCountries.map((c, i) => `${i + 1}. ${c.name}: ${c.emissions.co2.toLocaleString()} MT (${c.share?.toFixed(1)}% global share)`).join('\n')}

REGIONAL EMISSIONS:
${regionalData.regions.map(r => `• ${r.name}: ${r.emissions.toLocaleString()} MT (${r.percentage}%)`).join('\n')}

NOTE: This is country-level data. For city/state-level questions, use your training knowledge to provide helpful estimates and context.
`;
  } catch (error) {
    console.error('Failed to fetch emissions context:', error.message);
    return 'Live data temporarily unavailable. Use your training knowledge to answer environmental questions.';
  }
}

/**
 * Constructs the full system prompt with live data
 */
async function getSystemPrompt() {
  const template = loadPromptTemplate();
  const dataContext = await buildDataContext();
  return template.replace('{{DATA_CONTEXT}}', dataContext);
}

/**
 * POST /api/chat
 * Main chat endpoint
 */
chatRouter.post('/', async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    // Validate input
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ 
        error: 'Message is required and must be a string' 
      });
    }

    // Trim and validate message length
    const userMessage = message.trim();
    if (userMessage.length === 0) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }
    if (userMessage.length > 2000) {
      return res.status(400).json({ error: 'Message too long (max 2000 characters)' });
    }

    // Validate history format
    const validHistory = Array.isArray(history) 
      ? history.filter(h => h && typeof h.role === 'string' && typeof h.content === 'string')
      : [];

    // Build system prompt with emissions context
    const systemPrompt = await getSystemPrompt();

    // Generate response using AI service
    const result = await aiService.chat({
      systemPrompt,
      messages: validHistory.slice(-20),
      userMessage,
      maxTokens: 1500,
      temperature: 0.75
    });

    // Return response
    res.json({
      response: result.response,
      source: result.source
    });

  } catch (error) {
    console.error('Chat endpoint error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      response: 'Sorry, something went wrong. Please try again.',
      source: 'error'
    });
  }
});

/**
 * GET /api/chat/status
 * Check AI service status
 */
chatRouter.get('/status', (req, res) => {
  res.json({
    available: aiService.isAvailable(),
    provider: aiService.getProviderName(),
    providers: AIService.getAvailableProviders()
  });
});

export default chatRouter;
