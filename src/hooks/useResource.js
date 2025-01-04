import { useState, useCallback } from 'react';
import { resourceService } from '@/api/services/resourceService';

export function useResource() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getResources = useCallback(async (page = 1, limit = 100) => {
    setLoading(true);
    setError('');
    try {
      const response = await resourceService.getResources(page, limit);
      if (response.success) {
        setResources(response.data);
        return response;
      } else {
        throw new Error(response.message);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch resources');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadResource = useCallback(async (resourceData) => {
    try {
      const response = await resourceService.uploadResource(resourceData);
      if (response.success) {
        await getResources(); // Refresh the list
        return response;
      } else {
        throw new Error(response.message);
      }
    } catch (err) {
      throw err;
    }
  }, [getResources]);

  const updateResource = useCallback(async (id, resourceData) => {
    try {
      const response = await resourceService.updateResource(id, resourceData);
      if (response.success) {
        await getResources(); // Refresh the list
        return response;
      } else {
        throw new Error(response.message);
      }
    } catch (err) {
      throw err;
    }
  }, [getResources]);

  const deleteResource = useCallback(async (id) => {
    try {
      const response = await resourceService.deleteResource(id);
      if (response.success) {
        await getResources(); // Refresh the list
        return response;
      } else {
        throw new Error(response.message);
      }
    } catch (err) {
      throw err;
    }
  }, [getResources]);

  return {
    resources,
    loading,
    error,
    getResources,
    uploadResource,
    updateResource,
    deleteResource
  };
}

