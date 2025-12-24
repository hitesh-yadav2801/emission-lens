/**
 * AI Service
 * Factory for managing AI providers with modular, scalable architecture
 * 
 * Usage:
 *   import AIService from './services/ai/index.js';
 *   const ai = new AIService('openai');
 *   const response = await ai.chat({ systemPrompt, messages, userMessage });
 */

import OpenAIProvider from './providers/openai.js';
// Future providers can be added here:
// import AnthropicProvider from './providers/anthropic.js';
// import GeminiProvider from './providers/gemini.js';

// Provider registry - add new providers here
const PROVIDERS = {
  openai: OpenAIProvider,
  // anthropic: AnthropicProvider,
  // gemini: GeminiProvider,
};

// User-friendly error messages
const ERROR_MESSAGES = {
  rate_limit: 'Our AI service is experiencing high demand. Please try again in a few minutes.',
  auth_error: 'AI service configuration issue. Please contact support.',
  not_configured: 'Our AI assistant is currently unavailable. Please try again later.',
  default: 'Sorry, I couldn\'t process your request right now. Please try again in a moment.'
};

export class AIService {
  constructor(providerName = 'openai', config = {}) {
    this.providerName = providerName;
    this.provider = this.createProvider(providerName, config);
  }

  /**
   * Create a provider instance
   */
  createProvider(name, config) {
    const ProviderClass = PROVIDERS[name];
    if (!ProviderClass) {
      console.error(`Unknown AI provider: ${name}. Available: ${Object.keys(PROVIDERS).join(', ')}`);
      return null;
    }
    return new ProviderClass(config);
  }

  /**
   * Check if AI is available
   */
  isAvailable() {
    return this.provider?.isConfigured() ?? false;
  }

  /**
   * Get current provider name
   */
  getProviderName() {
    return this.provider?.getName() ?? 'none';
  }

  /**
   * Switch to a different provider at runtime
   */
  switchProvider(providerName, config = {}) {
    this.providerName = providerName;
    this.provider = this.createProvider(providerName, config);
    return this.isAvailable();
  }

  /**
   * Generate a chat response
   * @param {Object} options
   * @param {string} options.systemPrompt - System instructions
   * @param {Array} options.messages - Chat history [{role, content}]
   * @param {string} options.userMessage - Current user message
   * @param {number} options.maxTokens - Max response tokens
   * @param {number} options.temperature - Response creativity (0-1)
   * @returns {Promise<{response: string, source: string}>}
   */
  async chat({ systemPrompt, messages = [], userMessage, maxTokens = 1000, temperature = 0.7 }) {
    // Check if provider is available
    if (!this.isAvailable()) {
      return {
        response: ERROR_MESSAGES.not_configured,
        source: 'unavailable'
      };
    }

    // Generate response
    const result = await this.provider.generateResponse({
      systemPrompt,
      messages,
      userMessage,
      maxTokens,
      temperature
    });

    // Handle errors
    if (result.error) {
      const errorMessage = ERROR_MESSAGES[result.error] || ERROR_MESSAGES.default;
      return {
        response: errorMessage,
        source: 'unavailable'
      };
    }

    return {
      response: result.content,
      source: this.getProviderName()
    };
  }

  /**
   * List available providers
   */
  static getAvailableProviders() {
    return Object.keys(PROVIDERS);
  }
}

export default AIService;

