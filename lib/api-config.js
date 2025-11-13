// API Configuration for switching between Firestore and Neon Postgres
// Set USE_NEON_DB to true to use Neon Postgres, false to use Firestore

export const USE_NEON_DB = process.env.USE_NEON_DB === 'true';

// API endpoint mappings
export const API_ENDPOINTS = {
  USER_PROFILE: USE_NEON_DB ? '/api/user/profile-neon' : '/api/user/profile',
  CREDITS_DEDUCT: USE_NEON_DB ? '/api/credits/deduct-neon' : '/api/credits/deduct',
  ENHANCE_PROMPT: USE_NEON_DB ? '/api/enhance-neon' : '/api/enhance',
  LIBRARY: USE_NEON_DB ? '/api/library-neon' : '/api/library',
  PAYMENT_VERIFY: USE_NEON_DB ? '/api/payment/verify-neon' : '/api/payment/verify',
};

// Helper function to get the correct API endpoint
export function getApiEndpoint(endpointKey) {
  return API_ENDPOINTS[endpointKey] || endpointKey;
}

// Database configuration
export const DB_CONFIG = {
  type: USE_NEON_DB ? 'neon' : 'firestore',
  isNeon: USE_NEON_DB,
  isFirestore: !USE_NEON_DB,
};

console.log(`Database mode: ${DB_CONFIG.type.toUpperCase()}`);

export default {
  USE_NEON_DB,
  API_ENDPOINTS,
  getApiEndpoint,
  DB_CONFIG
};
