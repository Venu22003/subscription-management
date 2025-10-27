/**
 * Enhanced Authentication API Service
 * All authentication-related API calls
 */

import api from './api';

export const authApi = {
  // Signup
  signup: async (name, email, password) => {
    const response = await api.post('/auth/signup', {
      name,
      email,
      password,
      confirmPassword: password,
    });
    return response;
  },

  // Login
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response;
  },

  // Logout
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response;
  },

  // Refresh token
  refreshToken: async (refreshToken) => {
    const response = await api.post('/auth/refresh-token', { refreshToken });
    return response;
  },

  // Forgot password
  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response;
  },

  // Reset password
  resetPassword: async (token, password) => {
    const response = await api.post(`/auth/reset-password/${token}`, {
      password,
      confirmPassword: password,
    });
    return response;
  },

  // Verify email
  verifyEmail: async (token) => {
    const response = await api.get(`/auth/verify-email/${token}`);
    return response;
  },

  // Get profile
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.user;
  },

  // Update profile
  updateProfile: async (profileData) => {
    const response = await api.put('/auth/profile', profileData);
    return response.user;
  },

  // Change password
  changePassword: async (currentPassword, newPassword) => {
    const response = await api.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response;
  },

  // Delete account
  deleteAccount: async () => {
    const response = await api.delete('/auth/account');
    return response;
  },
};

export default authApi;
