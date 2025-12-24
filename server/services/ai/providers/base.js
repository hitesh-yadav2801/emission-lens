/**
 * Base AI Provider Interface
 * All AI providers must implement this interface
 */

export class BaseAIProvider {
  constructor(config = {}) {
    this.config = config;
    this.name = 'base';
  }

  /**
   * Check if the provider is properly configured
   * @returns {boolean}
   */
  isConfigured() {
    throw new Error('isConfigured() must be implemented by provider');
  }

  /**
   * Generate a chat completion
   * @param {Object} options
   * @param {string} options.systemPrompt - System instructions
   * @param {Array} options.messages - Chat history [{role, content}]
   * @param {string} options.userMessage - Current user message
   * @param {number} options.maxTokens - Max response tokens
   * @param {number} options.temperature - Response creativity (0-1)
   * @returns {Promise<{content: string, error: string|null}>}
   */
  async generateResponse(options) {
    throw new Error('generateResponse() must be implemented by provider');
  }

  /**
   * Get provider name
   * @returns {string}
   */
  getName() {
    return this.name;
  }
}

export default BaseAIProvider;

