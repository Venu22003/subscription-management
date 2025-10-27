import axios from 'axios';
import API_ENDPOINTS from './apiConfig';

const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const signup = (userData) => {
  return axios.post(API_ENDPOINTS.AUTH.SIGNUP, userData);
};

export const login = (credentials) => {
  return axios.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
};

export const logout = () => {
  // Clear local storage
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('theme');
  
  // Return resolved promise for consistency
  return Promise.resolve({ message: 'Logged out successfully' });
};

export const forgotPassword = (email) => {
  return axios.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
};

export const resetPassword = (token, password) => {
  return axios.post(API_ENDPOINTS.AUTH.RESET_PASSWORD(token), { password });
};

export const getProfile = () => {
  return axios.get(API_ENDPOINTS.AUTH.PROFILE, getAuthHeaders());
};

export const updateProfile = (data) => {
  return axios.put(API_ENDPOINTS.AUTH.UPDATE_PROFILE, data, getAuthHeaders());
};