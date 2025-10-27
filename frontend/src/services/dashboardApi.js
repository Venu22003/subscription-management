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

export const getDashboardStats = () => {
  return axios.get(API_ENDPOINTS.DASHBOARD.STATS, getAuthHeaders());
};