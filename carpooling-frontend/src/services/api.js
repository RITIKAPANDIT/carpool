import axios from 'axios';

const API_URL = 'http://localhost:4000/api';

// Create axios instance with defaults
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const register = async (formData) => {
  try {
    const response = await axios.post(`${API_URL}/auth/register`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const login = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

// Emergency Alert API
export const sendEmergencyAlert = async (location) => {
  try {
    const response = await api.post('/sos/emergency', location);
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

// Ride APIs
export const searchRides = async (params) => {
  try {
    const response = await api.get('/rides/search', { params });
    return response.data.rides || [];
  } catch (error) {
    throw handleError(error);
  }
};

export const createRide = async (rideData) => {
  try {
    const response = await api.post('/rides', rideData);
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const joinRide = async (rideId) => {
  try {
    const response = await api.post(`/rides/join/${rideId}`);
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const getUserRides = async () => {
  try {
    const response = await api.get('/rides/myrides');
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const acceptRideRequest = async (rideId, userId) => {
  try {
    const response = await api.post(`/rides/accept/${rideId}`, { userId });
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const rejectRideRequest = async (rideId, userId) => {
  try {
    const response = await api.post(`/rides/reject/${rideId}`, { userId });
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

// Error handler
const handleError = (error) => {
  console.error('API Error:', {
    message: error.message,
    response: error.response?.data,
    status: error.response?.status
  });

  if (error.code === 'ECONNABORTED') {
    return new Error('Request timeout. Please try again.');
  }

  if (!error.response) {
    return new Error('Network error. Please check your connection.');
  }

  const message = error.response.data?.message || 'Something went wrong. Please try again.';
  const customError = new Error(message);
  customError.status = error.response.status;
  return customError;
};

export default api;