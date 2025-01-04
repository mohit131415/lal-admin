import { apiRequest, createRequestConfig } from '../config/apiConfig';

export const resourceService = {
  async getResources(page = 1, limit = 100) {
    try {
      const config = createRequestConfig('GET');
      const response = await apiRequest(
        `/resources/get-resources-api.php?page=${page}&limit=${limit}`,
        config
      );

      // Check if response has the expected structure
      if (response?.status === 'success' && response?.data?.resources) {
        return {
          success: true,
          data: response.data.resources,
          pagination: response.data.pagination
        };
      }

      throw new Error('Invalid response format');
    } catch (error) {
      console.error('Get resources error:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch resources',
        data: []
      };
    }
  },

  async uploadResource(resourceData) {
    try {
      const formData = new FormData();
      if (resourceData.file) {
        formData.append('file', resourceData.file);
      }
      formData.append('name', resourceData.name);
      formData.append('description', resourceData.description);
      if (resourceData.thumbnail) {
        formData.append('thumbnail', resourceData.thumbnail);
      }

      const response = await apiRequest(
        '/resources/upload-resource-api.php',
        createRequestConfig('POST', formData)
      );

      if (response?.status === 'success') {
        return {
          success: true,
          data: response.data,
          message: response.message || 'Resource uploaded successfully'
        };
      }

      throw new Error(response?.message || 'Upload failed');
    } catch (error) {
      console.error('Upload resource error:', error);
      return {
        success: false,
        message: error.message || 'Failed to upload resource'
      };
    }
  },

  async updateResource(id, resourceData) {
    try {
      const formData = new FormData();
      formData.append('id', id);
      if (resourceData.file) {
        formData.append('file', resourceData.file);
      }
      formData.append('name', resourceData.name);
      formData.append('description', resourceData.description);
      if (resourceData.thumbnail) {
        formData.append('thumbnail', resourceData.thumbnail);
      }

      const response = await apiRequest(
        '/resources/update-resource-api.php',
        createRequestConfig('POST', formData)
      );

      if (response?.status === 'success') {
        return {
          success: true,
          data: response.data,
          message: response.message || 'Resource updated successfully'
        };
      }

      throw new Error(response?.message || 'Update failed');
    } catch (error) {
      console.error('Update resource error:', error);
      return {
        success: false,
        message: error.message || 'Failed to update resource'
      };
    }
  },

  async deleteResource(id) {
    try {
      const response = await apiRequest(
        '/resources/delete-resource-api.php',
        createRequestConfig('DELETE', { id })
      );

      if (response?.status === 'success') {
        return {
          success: true,
          message: response.message || 'Resource deleted successfully'
        };
      }

      throw new Error(response?.message || 'Delete failed');
    } catch (error) {
      console.error('Delete resource error:', error);
      return {
        success: false,
        message: error.message || 'Failed to delete resource'
      };
    }
  }
};

