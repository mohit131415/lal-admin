// Adds authentication headers to requests
export const authInterceptor = (config) => {
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${token}`
      };
    }
    
    return config;
  };
  
  // Handles token refresh if needed
  export const refreshTokenInterceptor = async (error) => {
    const originalRequest = error.config;
  
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const token = localStorage.getItem('refreshToken');
        // Implement token refresh logic here
        // const response = await refreshTokenRequest(token);
        // localStorage.setItem('token', response.data.token);
        
        originalRequest.headers['Authorization'] = `Bearer ${token}`;
        return fetch(originalRequest);
      } catch (error) {
        return Promise.reject(error);
      }
    }
    
    return Promise.reject(error);
  };