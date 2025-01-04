import { useState, useCallback } from 'react';
import { blogService } from '../api/services/blogService';

export const useBlog = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState({ posts: [], pagination: null });

  const getPosts = useCallback(async (page = 1, limit = 10) => {
    setLoading(true);
    setError(null);
    try {
      const response = await blogService.getPosts(page, limit);
      if (response?.status === 'success' && response?.data) {
        setData(response.data);
        return response.data;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch posts';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const getPost = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await blogService.getPost(id);
      if (response?.status === 'success' && response?.data) {
        return response.data;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch post';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const createPost = useCallback(async (postData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await blogService.createPost(postData);
      if (response?.status === 'success' && response?.data) {
        setData(prev => ({
          ...prev,
          posts: [response.data, ...(prev.posts || [])]
        }));
        return response.data;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to create post';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePost = useCallback(async (id, postData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await blogService.updatePost(id, postData);
      if (response?.status === 'success' && response?.data) {
        setData(prev => ({
          ...prev,
          posts: prev.posts.map(post => 
            post.id === id ? { ...post, ...response.data } : post
          )
        }));
        return response.data;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to update post';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const deletePost = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await blogService.deletePost(id);
      if (response?.status === 'success') {
        setData(prev => ({
          ...prev,
          posts: prev.posts.filter(post => post.id !== id)
        }));
        return true;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to delete post';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveDraft = useCallback(async (postData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await blogService.saveDraft(postData);
      if (response?.status === 'success' && response?.data) {
        return response.data;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to save draft';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadImage = useCallback(async (file, type = 'content', postId = null) => {
    setLoading(true);
    setError(null);
    try {
      const response = await blogService.uploadImage(file, type, postId);
      if (response?.status === 'success' && response?.data) {
        return response.data;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to upload image';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    data,
    loading,
    error,
    getPosts,
    getPost,
    createPost,
    updatePost,
    deletePost,
    saveDraft,
    uploadImage
  };
};

