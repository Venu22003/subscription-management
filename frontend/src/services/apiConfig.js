const API_BASE_URL = 'http://localhost:5000/api';

const API_ENDPOINTS = {
  AUTH: {
    SIGNUP: `${API_BASE_URL}/auth/signup`,
    LOGIN: `${API_BASE_URL}/auth/login`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
    FORGOT_PASSWORD: `${API_BASE_URL}/auth/forgot-password`,
    RESET_PASSWORD: (token) => `${API_BASE_URL}/auth/reset-password/${token}`,
    PROFILE: `${API_BASE_URL}/auth/profile`,
    UPDATE_PROFILE: `${API_BASE_URL}/auth/profile`,
  },
  
  SUBSCRIPTIONS: {
    GET_ALL: `${API_BASE_URL}/subscriptions`,
    GET_BY_ID: (id) => `${API_BASE_URL}/subscriptions/${id}`,
    ADD: `${API_BASE_URL}/subscriptions`,
    UPDATE: (id) => `${API_BASE_URL}/subscriptions/${id}`,
    DELETE: (id) => `${API_BASE_URL}/subscriptions/${id}`,
    DUPLICATE: (id) => `${API_BASE_URL}/subscriptions/${id}/duplicate`,
    MARK_PAID: (id) => `${API_BASE_URL}/subscriptions/${id}/mark-paid`,
    PAYMENT_HISTORY: `${API_BASE_URL}/subscriptions/history/payments`,
  },
  
  CATEGORIES: {
    GET_ALL: `${API_BASE_URL}/categories`,
    ADD: `${API_BASE_URL}/categories`,
  },
  
  DASHBOARD: {
    STATS: `${API_BASE_URL}/dashboard/stats`,
  },
};

export default API_ENDPOINTS;