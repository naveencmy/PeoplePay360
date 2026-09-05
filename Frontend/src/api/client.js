import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
});

// Request interceptor to attach bearer token
apiClient.interceptors.request.use((config) => {
  let token = localStorage.getItem('token');
  if (!token) {
    try {
      const auth = JSON.parse(localStorage.getItem('auth-storage') || '{}');
      token = auth?.state?.token;
      if (token) {
        localStorage.setItem('token', token);
      }
    } catch {}
  }
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Response interceptor to unwrap envelope and normalize errors
apiClient.interceptors.response.use(
  (response) => {
    // Check if the response follows the { success, data, meta, error } envelope
    if (response.data && response.data.hasOwnProperty('success')) {
      if (!response.data.success) {
        return Promise.reject(handleApiError(response.data.error));
      }
      return response.data.data;
    }
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      try {
        const auth = JSON.parse(localStorage.getItem('auth-storage') || '{}');
        if (auth?.state) {
          auth.state.isAuthenticated = false;
          auth.state.token = null;
          auth.state.user = null;
          localStorage.setItem('auth-storage', JSON.stringify(auth));
        }
      } catch {}
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(handleApiError(error));
  }
);

export const handleApiError = (error) => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    const { data } = error.response;
    return {
      code: data?.error?.code || error.response.status,
      message: data?.error?.message || 'Server Error',
      details: data?.error?.details || null,
    };
  } else if (error.request) {
    // The request was made but no response was received
    return {
      code: 'NETWORK_ERROR',
      message: 'Network Error: Please check your connection.',
      details: null,
    };
  } else {
    // Something happened in setting up the request that triggered an Error
    return {
      code: error.code || 'UNKNOWN_ERROR',
      message: error.message || 'An unknown error occurred.',
      details: null,
    };
  }
};

export { apiClient };
