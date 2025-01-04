import { useState, useCallback } from 'react';
import { api } from '../utils/api';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(async (endpoint, options = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.request(endpoint, options);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const get = useCallback((endpoint) => request(endpoint), [request]);
  
  const post = useCallback((endpoint, data) => 
    request(endpoint, { method: 'POST', body: JSON.stringify(data) }), [request]);
  
  const put = useCallback((endpoint, data) => 
    request(endpoint, { method: 'PUT', body: JSON.stringify(data) }), [request]);
  
  const del = useCallback((endpoint) => 
    request(endpoint, { method: 'DELETE' }), [request]);

  return {
    loading,
    error,
    request,
    get,
    post,
    put,
    delete: del
  };
};