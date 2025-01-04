import { apiRequest, createRequestConfig, API_ENDPOINTS } from '../config/apiConfig';

export const dashboardService = {
  async getStats() {
    try {
      console.log('Fetching dashboard stats...');
      const config = createRequestConfig('GET');
      const response = await apiRequest(API_ENDPOINTS.dashboard.stats, config);
      console.log('Stats response:', response);
      return response;
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw error;
    }
  },

  async getLogs(page = 1, limit = 10) {
    try {
      console.log('Fetching dashboard logs...');
      const config = createRequestConfig('GET');
      const response = await apiRequest(`${API_ENDPOINTS.dashboard.logs}?page=${page}&limit=${limit}`, config);
      console.log('Logs response:', response);
      return response;
    } catch (error) {
      console.error('Error fetching logs:', error);
      throw error;
    }
  }
};

