import { API_CONFIG } from '../config/apiConfig';

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export const authService = {
  _lastVerification: 0,
  _sessionExpiry: 0,

  async login(credentials) {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.AUTH.LOGIN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(credentials)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      if (data.status === 'success' && data.data?.token) {
        // Set session expiry
        this._sessionExpiry = Date.now() + API_CONFIG.SESSION.DURATION;
        localStorage.setItem('sessionExpiry', this._sessionExpiry.toString());
        
        // Store auth data
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        
        this._lastVerification = Date.now();
        return { success: true, data: data.data };
      } else {
        throw new Error(data.message || 'Invalid login response');
      }
    } catch (error) {
      console.error('Login error:', error);
      this.clearAuth();
      throw error;
    }
  },

  async verifyToken(force = false) {
    try {
      const token = localStorage.getItem('token');
      const sessionExpiry = parseInt(localStorage.getItem('sessionExpiry') || '0');
      
      if (!token) {
        return { success: false, message: 'No token found' };
      }

      // Check if session has expired
      if (Date.now() > sessionExpiry) {
        this.clearAuth();
        return { success: false, message: 'Session expired' };
      }

      // Return cached user if verification was recent and not forced
      const now = Date.now();
      if (!force && (now - this._lastVerification < API_CONFIG.SESSION.VERIFICATION_DEBOUNCE)) {
        const user = this.getCurrentUser();
        return user ? { success: true, data: { user } } : { success: false, message: 'No user data' };
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.AUTH.VERIFY_TOKEN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });

      const data = await response.json();
      this._lastVerification = now;

      if (!response.ok) {
        this.clearAuth();
        return { success: false, message: data.message || 'Token verification failed' };
      }

      if (data.status === 'success' && data.data?.user) {
        // Extend session on successful verification
        this._sessionExpiry = Date.now() + API_CONFIG.SESSION.DURATION;
        localStorage.setItem('sessionExpiry', this._sessionExpiry.toString());
        
        // Update user data if changed
        const currentUser = this.getCurrentUser();
        if (JSON.stringify(currentUser) !== JSON.stringify(data.data.user)) {
          localStorage.setItem('user', JSON.stringify(data.data.user));
        }
        return { success: true, data: data.data };
      }

      this.clearAuth();
      return { success: false, message: 'Invalid token verification response' };
    } catch (error) {
      console.error('Token verification error:', error);
      this.clearAuth();
      return { success: false, message: error.message };
    }
  },

  debouncedVerifyToken: debounce(async function(force = false) {
    return await this.verifyToken(force);
  }, API_CONFIG.SESSION.VERIFICATION_DEBOUNCE),

  getCurrentUser() {
    try {
      const sessionExpiry = parseInt(localStorage.getItem('sessionExpiry') || '0');
      if (Date.now() > sessionExpiry) {
        this.clearAuth();
        return null;
      }

      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      this.clearAuth();
      return null;
    }
  },

  isAuthenticated() {
    try {
      const sessionExpiry = parseInt(localStorage.getItem('sessionExpiry') || '0');
      if (Date.now() > sessionExpiry) {
        this.clearAuth();
        return false;
      }

      const token = localStorage.getItem('token');
      const user = this.getCurrentUser();
      return !!(token && user);
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  },

  clearAuth() {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('sessionExpiry');
      this._lastVerification = 0;
      this._sessionExpiry = 0;
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  },

  async logout() {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.AUTH.LOGOUT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Logout failed');
      }

      this.clearAuth();
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      this.clearAuth();
      throw error;
    }
  }
};

