/**
 * Application Configuration
 * Handles environment-specific settings
 */

// API Base URL - empty string for same-origin, or full URL for external API
export const API_URL = import.meta.env.VITE_API_URL || '';

// Helper to build API endpoints
export const api = {
  chat: `${API_URL}/api/chat`,
  search: `${API_URL}/api/search`,
  emissions: {
    years: `${API_URL}/api/emissions/years`,
    summary: `${API_URL}/api/emissions/summary`,
    byIndustry: `${API_URL}/api/emissions/by-industry`,
    bySector: `${API_URL}/api/emissions/by-sector`,
    trends: `${API_URL}/api/emissions/trends`,
    byRegion: `${API_URL}/api/emissions/by-region`,
    countries: `${API_URL}/api/emissions/countries`,
  }
};

