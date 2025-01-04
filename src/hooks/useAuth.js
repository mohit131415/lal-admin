import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../api/services/authService';
import { useAuth as useAuthContext } from '../context/AuthContext';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login: contextLogin, logout: contextLogout, user, isLoggedIn } = useAuthContext();

  const login = useCallback(async (credentials) => {
    setLoading(true);
    setError('');
    try {
      const response = await authService.login(credentials);

      if (!response || !response.token) {
        throw new Error('Invalid login response');
      }

      await contextLogin(response);
      navigate('/');
      return response;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [navigate, contextLogin]);

  const logout = useCallback(() => {
    if (window.confirm('Are you sure you want to log out?')) {
      contextLogout();
      navigate('/login');
    }
  }, [navigate, contextLogout]);

  return {
    loading,
    error,
    login,
    logout,
    isLoggedIn,
    user,
  };
};
