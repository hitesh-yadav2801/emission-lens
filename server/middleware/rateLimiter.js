/**
 * Rate Limiting Middleware
 * Protects API endpoints from abuse and controls costs
 */

import rateLimit from 'express-rate-limit';

/**
 * Creates a rate limiter 
 * @param {Object} options - Rate limiter options
 * @param {number} options.maxRequests - Maximum requests per window
 * @param {number} options.windowMinutes - Time window in minutes
 * @param {string} options.name - Name for the limiter (used in error messages)
 */
function createLimiter({ maxRequests, windowMinutes = 1, name }) {
  return rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    max: maxRequests,
    standardHeaders: true,
    legacyHeaders: false,
    
    // User-friendly error response
    handler: (req, res) => {
      const retryAfter = Math.ceil(windowMinutes * 60);
      res.status(429).json({
        success: false,
        error: 'Rate limit exceeded',
        message: `Too many ${name} requests. Please wait ${windowMinutes} minute${windowMinutes > 1 ? 's' : ''} before trying again.`,
        retryAfter,
        limit: maxRequests,
        window: `${windowMinutes} minute${windowMinutes > 1 ? 's' : ''}`
      });
    }
  });
}

// Chat endpoint 
export const chatLimiter = createLimiter({
  maxRequests: 5,
  windowMinutes: 1,
  name: 'chat'
});

// Search endpoint 
export const searchLimiter = createLimiter({
  maxRequests: 15,
  windowMinutes: 1,
  name: 'search'
});

// Emissions endpoint 
export const emissionsLimiter = createLimiter({
  maxRequests: 30,
  windowMinutes: 1,
  name: 'emissions'
});

// Health endpoint 
export const healthLimiter = createLimiter({
  maxRequests: 30,
  windowMinutes: 1,
  name: 'health'
});

// Export all limiters
export default {
  chat: chatLimiter,
  search: searchLimiter,
  emissions: emissionsLimiter,
  health: healthLimiter
};

