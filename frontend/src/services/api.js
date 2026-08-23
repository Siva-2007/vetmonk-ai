import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

// Request interceptor: attach JWT if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('vetmonk_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Do NOT force application/json for FormData requests.
    // The browser/Axios will automatically set the correct
    // multipart/form-data Content-Type with its boundary.
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    } else {
      config.headers['Content-Type'] = 'application/json';
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle token expiration or unauthorized access
api.interceptors.response.use(
  (response) => response,

  (error) => {
    if (error.response && error.response.status === 401) {

      const isAuthRequest =
        error.config?.url?.includes('/auth/login') ||
        error.config?.url?.includes('/auth/register');

      if (!isAuthRequest) {
        localStorage.removeItem('vetmonk_token');
        localStorage.removeItem('vetmonk_user');

        if (
          window.location.pathname !== '/login' &&
          window.location.pathname !== '/'
        ) {
          window.location.href = '/login?expired=true';
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;