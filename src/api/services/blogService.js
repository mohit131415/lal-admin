import { API_ENDPOINTS, createRequestConfig, getFullUrl, handleApiResponse, handleApiError } from '../config/apiConfig';

export const blogService = {
  // Get all blog posts
  async getPosts(page = 1, limit = 10) {
    try {
      const queryParams = new URLSearchParams({ page: String(page), limit: String(limit) }).toString();
      const response = await fetch(
        `${getFullUrl(API_ENDPOINTS.blog.list)}?${queryParams}`,
        createRequestConfig('GET')
      );
      return await handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get single blog post
  async getPost(id) {
    try {
      const response = await fetch(
        `${getFullUrl(API_ENDPOINTS.blog.get)}?id=${id}`,
        createRequestConfig('GET')
      );
      return await handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Create new blog post
  async createPost(postData) {
    try {
      const formData = new FormData();
      
      // Append post data
      Object.keys(postData).forEach(key => {
        if (key === 'tags' && Array.isArray(postData[key])) {
          formData.append(key, JSON.stringify(postData[key]));
        } else if (key !== 'featured_image' || !postData[key] instanceof File) {
          formData.append(key, postData[key]);
        }
      });

      // Append featured image if exists
      if (postData.featured_image instanceof File) {
        formData.append('featured_image', postData.featured_image);
      }

      const response = await fetch(
        getFullUrl(API_ENDPOINTS.blog.create),
        createRequestConfig('POST', formData)
      );
      return await handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Update existing blog post
  async updatePost(id, postData) {
    try {
      const formData = new FormData();
      formData.append('id', id);
      
      // Append post data
      Object.keys(postData).forEach(key => {
        if (key === 'tags' && Array.isArray(postData[key])) {
          formData.append(key, JSON.stringify(postData[key]));
        } else if (key !== 'featured_image' || !postData[key] instanceof File) {
          formData.append(key, postData[key]);
        }
      });

      // Append featured image if exists
      if (postData.featured_image instanceof File) {
        formData.append('featured_image', postData.featured_image);
      }

      const response = await fetch(
        getFullUrl(API_ENDPOINTS.blog.update),
        createRequestConfig('POST', formData)
      );
      return await handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Delete blog post
  async deletePost(id) {
    try {
      const response = await fetch(
        `${getFullUrl(API_ENDPOINTS.blog.delete)}?id=${id}`,
        createRequestConfig('DELETE')
      );
      return await handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Save draft
  async saveDraft(postData) {
    try {
      const response = await fetch(
        getFullUrl('/blog/save-draft-api.php'),
        createRequestConfig('POST', postData)
      );
      return await handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Upload image
  async uploadImage(file, type = 'content', postId = null) {
    try {
      const formData = new FormData();
      formData.append('image', file);
      if (type) formData.append('type', type);
      if (postId) formData.append('post_id', postId);

      const response = await fetch(
        getFullUrl('/blog/upload-image-api.php'),
        createRequestConfig('POST', formData)
      );
      return await handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get image
  async getImage(filename, type = 'content') {
    try {
      const response = await fetch(
        `${getFullUrl('/blog/get-image-api.php')}?file=${filename}&type=${type}`,
        createRequestConfig('GET')
      );
      return await handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  }
};

