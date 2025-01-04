const API_BASE_URL = 'http://localhost/admin-api/contact';

export const contactService = {
  async getResponses(params = {}) {
    const queryParams = new URLSearchParams({
      page: params.page || 1,
      limit: params.limit || 10,
      status: params.status || '',
      search: params.search || '',
      date: params.date || ''
    }).toString();

    const response = await fetch(`${API_BASE_URL}/get-contacts-api.php?${queryParams}`);
    if (!response.ok) {
      throw new Error('Failed to fetch responses');
    }
    return await response.json();
  },

  async updateResponseStatus(id, status) {
    const response = await fetch(`${API_BASE_URL}/update-status-api.php`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, status })
    });
    
    if (!response.ok) {
      throw new Error('Failed to update status');
    }
    return await response.json();
  }
};

