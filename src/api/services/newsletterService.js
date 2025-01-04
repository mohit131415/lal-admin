import { API_ENDPOINTS, createRequestConfig, apiRequest } from '../config/apiConfig';

export const newsletterService = {
  async getSubscribers(page = 1, limit = 10, search = '', status = 'all') {
    try {
      // Validate endpoint exists
      if (!API_ENDPOINTS.newsletter.getSubscribers) {
        throw new Error('Newsletter API endpoint is not configured');
      }

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(status !== 'all' && { status })
      }).toString();

      const endpoint = `${API_ENDPOINTS.newsletter.getSubscribers}?${queryParams}`;
      console.log('Requesting subscribers from:', endpoint);

      const response = await apiRequest(
        endpoint,
        createRequestConfig('GET')
      );

      if (!response || typeof response !== 'object') {
        throw new Error('Invalid response format');
      }

      if (response.status === 'success' && response.data) {
        return {
          success: true,
          data: response.data.subscribers || [],
          pagination: response.data.pagination || {
            page,
            limit,
            total_records: 0,
            total_pages: 0
          }
        };
      }

      throw new Error(response.message || 'Invalid response format');
    } catch (error) {
      console.error('Get subscribers error:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch subscribers',
        data: [],
        pagination: {
          page,
          limit,
          total_records: 0,
          total_pages: 0
        }
      };
    }
  }
};
