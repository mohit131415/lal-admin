import { useState, useCallback } from 'react';
import { contactService } from '@/api/services/contactService';

export const useContact = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [responses, setResponses] = useState([]);

  const getResponses = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await contactService.getResponses(params);
      if (response.status === 'success') {
        setResponses(response.data.contacts);
      } else {
        throw new Error(response.message || 'Failed to fetch responses');
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateResponseStatus = useCallback(async (id, status) => {
    setLoading(true);
    setError(null);
    try {
      const response = await contactService.updateResponseStatus(id, status);
      if (response.status === 'success') {
        setResponses(current =>
          current.map(item => 
            item.id === id 
              ? { ...item, status } 
              : item
          )
        );
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to update status');
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    responses,
    loading,
    error,
    getResponses,
    updateResponseStatus
  };
};

