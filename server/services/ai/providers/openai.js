/**
 * OpenAI Provider
 * Implements AI chat using OpenAI's GPT models
 */

import OpenAI from 'openai';
import BaseAIProvider from './base.js';

export class OpenAIProvider extends BaseAIProvider {
  constructor(config = {}) {
    super(config);
    this.name = 'openai';
    this.model = config.model || 'gpt-4o-mini';
    this._client = null;
  }

  /**
   * Get or create OpenAI client (lazy initialization)
   */
  getClient() {
    if (this._client) return this._client;
    
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey && apiKey.startsWith('sk-')) {
      this._client = new OpenAI({ apiKey });
      return this._client;
    }
    return null;
  }

  isConfigured() {
    const apiKey = process.env.OPENAI_API_KEY;
    return apiKey && apiKey.startsWith('sk-');
  }

  async generateResponse({ systemPrompt, messages = [], userMessage, maxTokens = 1000, temperature = 0.7 }) {
    const client = this.getClient();
    
    if (!client) {
      return {
        content: null,
        error: 'OpenAI is not configured'
      };
    }

    try {
      // Build conversation with full context
      const conversationMessages = [
        { role: 'system', content: systemPrompt },
        ...messages.map(m => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content
        })),
        { role: 'user', content: userMessage }
      ];

      const completion = await client.chat.completions.create({
        model: this.model,
        messages: conversationMessages,
        temperature,
        max_tokens: maxTokens,
      });

      const content = completion.choices[0]?.message?.content;

      if (!content) {
        return {
          content: null,
          error: 'Empty response from model'
        };
      }

      return {
        content: content.trim(),
        error: null
      };
    } catch (error) {
      console.error(`[${this.name}] API Error:`, error.message);
      
      // Return specific error messages
      if (error.status === 429) {
        return {
          content: null,
          error: 'rate_limit'
        };
      }
      if (error.status === 401) {
        return {
          content: null,
          error: 'auth_error'
        };
      }
      
      return {
        content: null,
        error: error.message || 'Unknown error'
      };
    }
  }
}

export default OpenAIProvider;

