// API Client utility for switching between Firestore and Neon Postgres
// This utility helps frontend components use the correct API endpoints

// Check if we should use Neon DB (defaults to true now for production)
const USE_NEON_DB = true; // Force use Neon for now

// API endpoint mappings - ALL routes now use Neon Postgres
const API_ENDPOINTS = {
  // User endpoints
  USER_PROFILE: '/api/user/profile',
  
  // Credits endpoints
  CREDITS_DEDUCT: '/api/credits/deduct',
  
  // Enhancement endpoints
  ENHANCE_PROMPT: '/api/enhance',
  
  // Library endpoints
  LIBRARY: '/api/library',
  LIBRARY_FOLDERS: '/api/library/folders', // Keep existing for now
  LIBRARY_PROMPTS: '/api/library/prompts', // Keep existing for now
  LIBRARY_MOVE_PROMPT: '/api/library/move-prompt', // Keep existing for now
  LIBRARY_GENERATE: '/api/library/generate', // Keep existing for now
  
  // Payment endpoints
  PAYMENT_CREATE_ORDER: '/api/payment/create-order', // Keep existing
  PAYMENT_VERIFY: '/api/payment/verify',
  
  // Other endpoints
  COMPARE: '/api/compare',
  PLAYGROUND: '/api/playground',
  FEEDBACK: '/api/feedback',
  EMAIL_SUBSCRIPTION: '/api/email-subscription',
  RAZORPAY_CREATE_ORDER: '/api/razorpay/create-order',
  RAZORPAY_VERIFY: '/api/razorpay/verify',
};

// Helper function to get the correct API endpoint
function getApiEndpoint(endpointKey) {
  return API_ENDPOINTS[endpointKey] || endpointKey;
}

// Enhanced fetch wrapper with automatic endpoint resolution
async function apiCall(endpointKey, options = {}) {
  const endpoint = getApiEndpoint(endpointKey);
  
  // Add default headers
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  const fetchOptions = {
    ...options,
    headers: defaultHeaders
  };
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`API Call: ${endpoint} (${USE_NEON_DB ? 'Neon' : 'Firestore'})`);
  }
  
  return fetch(endpoint, fetchOptions);
}

// Specific API methods for common operations
const api = {
  // User operations
  async getUserProfile(token) {
    return apiCall('USER_PROFILE', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  },

  // Enhancement operations
  async enhancePrompt(originalPrompt, token) {
    return apiCall('ENHANCE_PROMPT', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ originalPrompt })
    });
  },

  // Credits operations
  async deductCredits(originalPrompt, enhancedPrompt, token) {
    return apiCall('CREDITS_DEDUCT', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ originalPrompt, enhancedPrompt })
    });
  },

  // Library operations
  async getLibrary(userId, token, category = null) {
    const params = new URLSearchParams({
      userId,
      token,
      ...(category && { category })
    });
    
    return apiCall('LIBRARY', {
      method: 'GET'
    }).then(response => 
      fetch(`${getApiEndpoint('LIBRARY')}?${params}`)
    );
  },

  async updateLibraryItem(userId, token, promptId, updates) {
    return apiCall('LIBRARY', {
      method: 'PATCH',
      body: JSON.stringify({ userId, token, promptId, updates })
    });
  },

  async createLibraryItem(userId, token, title, content, category) {
    return apiCall('LIBRARY', {
      method: 'POST',
      body: JSON.stringify({ userId, token, title, content, category })
    });
  },

  async deleteLibraryItem(userId, token, promptId) {
    const params = new URLSearchParams({ userId, token, promptId });
    return fetch(`${getApiEndpoint('LIBRARY')}?${params}`, {
      method: 'DELETE'
    });
  },

  // Payment operations
  async verifyPayment(razorpay_order_id, razorpay_payment_id, razorpay_signature, planDetails, token) {
    return apiCall('PAYMENT_VERIFY', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        planDetails
      })
    });
  }
};

// Database configuration info
const dbConfig = {
  type: USE_NEON_DB ? 'neon' : 'firestore',
  isNeon: USE_NEON_DB,
  isFirestore: !USE_NEON_DB,
};

// Function to toggle database for testing (development only)
function toggleDatabase() {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    const current = localStorage.getItem('USE_NEON_DB') === 'true';
    localStorage.setItem('USE_NEON_DB', (!current).toString());
    window.location.reload(); // Reload to apply changes
  }
}

// Log current database mode
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log(`🗄️ Database mode: ${dbConfig.type.toUpperCase()}`);
}

module.exports = {
  getApiEndpoint,
  apiCall,
  api,
  dbConfig,
  toggleDatabase,
  USE_NEON_DB
};
