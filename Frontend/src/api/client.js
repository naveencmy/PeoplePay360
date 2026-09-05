import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
});

// Request interceptor to attach bearer token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
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
