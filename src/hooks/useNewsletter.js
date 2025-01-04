import { useState, useCallback } from 'react';
import { newsletterService } from '../api/services/newsletterService';
import { toast } from 'react-toastify';

export const useNewsletter = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [subscribers, setSubscribers] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total_records: 0,
    total_pages: 0
  });

  const getSubscribers = useCallback(async (page = 1, limit = 10, search = '', status = 'all') => {
    setLoading(true);
    setError(null);
    try {
      const response = await newsletterService.getSubscribers(page, limit, search, status);
      if (response.success) {
        setSubscribers(response.data);
        setPagination(response.pagination);
        return response;
      } else {
        throw new Error(response.message || 'Failed to fetch subscribers');
      }
    } catch (err) {
      const message = err.message || 'Failed to fetch subscribers';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const subscribe = useCallback(async (email) => {
    setLoading(true);
    setError(null);
    try {
      const response = await newsletterService.subscribe(email);
      if (response.success) {
        toast.success(response.message || 'Successfully subscribed');
        await getSubscribers(); // Refresh the list
        return response;
      } else {
        throw new Error(response.message || 'Failed to subscribe');
      }
    } catch (err) {
      const message = err.message || 'Failed to subscribe';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getSubscribers]);

  const sendNewsletter = useCallback(async (newsletterData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await newsletterService.sendNewsletter(newsletterData);
      if (response.success) {
        toast.success(response.message || 'Newsletter sent successfully');
        return response;
      } else {
        throw new Error(response.message || 'Failed to send newsletter');
      }
    } catch (err) {
      const message = err.message || 'Failed to send newsletter';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    subscribers,
    pagination,
    loading,
    error,
    getSubscribers,
    subscribe,
    sendNewsletter
  };
};

