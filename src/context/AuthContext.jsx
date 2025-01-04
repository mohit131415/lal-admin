import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/api/services/authService';
import { toast } from 'react-toastify';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Initialize user from localStorage on mount
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const navigate = useNavigate();

  const checkAuth = async (skipNavigate = false) => {
    try {
      const result = await authService.verifyToken();
      
      if (result.success) {
        setUser(result.data.user);
        return true;
      } else {
        if (!skipNavigate) {
          handleLogout();
        } else {
          authService.clearAuth();
          setUser(null);
        }
        return false;
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      if (!skipNavigate) {
        handleLogout();
      } else {
        authService.clearAuth();
        setUser(null);
      }
      return false;
    }
  };

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        setLoading(true);
        
        // Check if we have a token and user data
        if (authService.isAuthenticated()) {
          const isValid = await checkAuth(true);
          
          // Only update state if component is still mounted
          if (mounted) {
            if (!isValid) {
              // Clear auth data but don't navigate during initialization
              authService.clearAuth();
              setUser(null);
            }
          }
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        if (mounted) {
          authService.clearAuth();
          setUser(null);
        }
      } finally {
        if (mounted) {
          setInitialized(true);
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Cleanup function to prevent memory leaks
    return () => {
      mounted = false;
    };
  }, []);

  // Session refresh interval
  useEffect(() => {
    if (!user) return;

    const refreshInterval = setInterval(() => {
      checkAuth(true);
    }, 4 * 60 * 1000); // Refresh every 4 minutes

    return () => clearInterval(refreshInterval);
  }, [user]);

  // Listen for storage events (logout in other tabs)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'token' || e.key === 'user') {
        if (!e.newValue) {
          setUser(null);
        } else if (e.key === 'user') {
          try {
            setUser(JSON.parse(e.newValue));
          } catch (error) {
            console.error('Failed to parse user data:', error);
          }
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLogin = async (credentials) => {
    try {
      setLoading(true);
      const response = await authService.login(credentials);
      
      if (response.success) {
        setUser(response.data.user);
        toast.success('Welcome back!');
        return response;
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      toast.error(error.message || 'Login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authService.clearAuth();
    setUser(null);
    navigate('/login', { replace: true });
  };

  // Don't render children until auth is initialized
  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
      </div>
    );
  }

  const value = {
    user,
    loading,
    login: handleLogin,
    logout: handleLogout,
    checkAuth,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

