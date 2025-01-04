// Add a helper function to get the base URL
export const getBaseUrl = () => {
  // For local development
  if (import.meta.env.DEV) {
    return import.meta.env.VITE_API_URL || 'http://localhost';
  }
  // For production
  return import.meta.env.VITE_API_URL || '';
}

export const API_CONFIG = {
  BASE_URL: '/api',
  AUTH: {
    LOGIN: '/auth/login-api.php',
    VERIFY_TOKEN: '/auth/verify-token-api.php',
    FORGOT_PASSWORD: '/auth/forgot-password-api.php',
    LOGOUT: '/admin-api/auth/logout-api.php'
  },
  SESSION: {
    DURATION: 8 * 60 * 60 * 1000, // 8 hours in milliseconds
    REFRESH_INTERVAL: 30 * 60 * 1000, // 4 minutes in milliseconds
    VERIFICATION_DEBOUNCE: 20 * 60 * 1000, // 1 second debounce for verification calls
  }
};

export const API_ENDPOINTS = {
  blog: {
    list: '/blog/get-blogs-api.php',
    create: '/blog/create-blog-api.php',
    get: '/blog/get-blog-api.php',
    update: '/blog/update-blog-api.php',
    delete: '/blog/delete-blog-api.php',
    saveDraft: '/blog/save-draft-api.php',
    uploadImage: '/blog/upload-image-api.php',
    getImage: '/blog/get-image-api.php'
  },
  resources: {
    list: '/resources/get-resources-api.php',
    upload: '/resources/upload-resource-api.php',
    update: '/resources/update-resource-api.php',
    delete: '/resources/delete-resource-api.php'
  },
  contact: {
    list: '/contact/get-contacts-api.php',
    update: '/contact/update-status-api.php',
    delete: '/contact/delete-contact-api.php'
  },
  newsletter: {
    subscribe: '/newsletter/subscribe-api.php',
    // Fix the getSubscribers endpoint
    getSubscribers: '/newsletter/get-subscribers-api.php',
    send: '/newsletter/send-newsletter-api.php'
  },
  dashboard: {
    stats: '/dashboard/stats.php',
    logs: '/dashboard/logs.php'
},
  uploads: {
    resources: '/uploads/resources',
    thumbnails: '/uploads/thumbnails',
    blog: '/uploads/blog'
  }
};

export const createRequestConfig = (method, body = null) => {
  const config = {
    method,
    headers: {
      'Accept': 'application/json'
    },
    credentials: 'include'
  };

  // Add auth token if available
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  if (body) {
    if (body instanceof FormData) {
      config.body = body;
    } else {
      config.headers['Content-Type'] = 'application/json';
      config.body = JSON.stringify(body);
    }
  }

  return config;
};

export const getFullUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

export const getImageUrl = (filename, type = 'content') => {
  if (!filename) return null;
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost';
  return `${baseUrl}/admin-api/blog/get-image-api.php?file=${filename}&type=${type}`;
};

export const getResourceUrl = (path) => {
  if (!path) return null;
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost';
  return `${baseUrl}/admin-api/resources/download-resource-api.php?file=${path}`;
};

export const handleApiResponse = async (response) => {
  try {
    const text = await response.text(); // Get the raw response text
    let data;

    try {
      data = JSON.parse(text); // Attempt to parse the text as JSON
    } catch (error) {
      console.error('Response is not valid JSON:', text); // Log the raw response
      throw new Error('Invalid response format');
    }

    if (!response.ok) {
      // Log the status code and URL for better debugging
      console.error(`Error: ${response.status} - ${response.url}`);
      
      // Handle specific error cases
      switch (response.status) {
        case 401:
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          throw new Error('Session expired. Please login again.');
        case 403:
          throw new Error('Access denied');
        case 404:
          throw new Error('Resource not found');
        default:
          throw new Error(data.message || 'An error occurred');
      }
    }
    
    return data;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('Invalid response format');
    }
    throw error;
  }
};

// Helper function to make API requests
export const apiRequest = async (endpoint, config) => {
  try {
    // Add logging to debug the endpoint
    console.log('Making API request to:', `${API_CONFIG.BASE_URL}${endpoint}`);
    
    if (!endpoint) {
      throw new Error('API endpoint is undefined');
    }

    const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, config);
    return await handleApiResponse(response);
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

export const handleApiError = (error) => {
  console.error('API Error:', error);
  throw error;
};