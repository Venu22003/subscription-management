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

export const getAllSubscriptions = () => {
  return axios.get(API_ENDPOINTS.SUBSCRIPTIONS.GET_ALL, getAuthHeaders());
};

export const getSubscriptionById = (id) => {
  return axios.get(API_ENDPOINTS.SUBSCRIPTIONS.GET_BY_ID(id), getAuthHeaders());
};

export const addSubscription = (data) => {
  return axios.post(API_ENDPOINTS.SUBSCRIPTIONS.ADD, data, getAuthHeaders());
};

export const updateSubscription = (id, data) => {
  return axios.put(API_ENDPOINTS.SUBSCRIPTIONS.UPDATE(id), data, getAuthHeaders());
};

export const deleteSubscription = (id) => {
  return axios.delete(API_ENDPOINTS.SUBSCRIPTIONS.DELETE(id), getAuthHeaders());
};

export const duplicateSubscription = (id) => {
  return axios.post(API_ENDPOINTS.SUBSCRIPTIONS.DUPLICATE(id), {}, getAuthHeaders());
};

export const markAsPaid = (id, paymentMethod) => {
  return axios.post(API_ENDPOINTS.SUBSCRIPTIONS.MARK_PAID(id), { paymentMethod }, getAuthHeaders());
};

export const getPaymentHistory = () => {
  return axios.get(API_ENDPOINTS.SUBSCRIPTIONS.PAYMENT_HISTORY, getAuthHeaders());
};