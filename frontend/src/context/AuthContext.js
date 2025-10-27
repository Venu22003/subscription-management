/**
 * Authentication Context Provider
 * Manages user authentication state and provides auth methods
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/authApi';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem('accessToken'));
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem('refreshToken'));
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');
      const refresh = localStorage.getItem('refreshToken');
      
      if (token) {
        try {
          const userData = await authApi.getProfile();
          setUser(userData);
          setIsAuthenticated(true);
        } catch (error) {
          // If token is invalid, try to refresh
          if (refresh) {
            try {
              const tokens = await authApi.refreshToken(refresh);
              setAccessToken(tokens.accessToken);
              setRefreshToken(tokens.refreshToken);
              localStorage.setItem('accessToken', tokens.accessToken);
              localStorage.setItem('refreshToken', tokens.refreshToken);
              
              const userData = await authApi.getProfile();
              setUser(userData);
              setIsAuthenticated(true);
            } catch (refreshError) {
              // Refresh failed, clear everything
              setUser(null);
              setAccessToken(null);
              setRefreshToken(null);
              setIsAuthenticated(false);
              localStorage.removeItem('accessToken');
              localStorage.removeItem('refreshToken');
              localStorage.removeItem('user');
            }
          }
        }
      }
      setLoading(false);
    };

    initAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authApi.login(email, password);
      setAccessToken(response.accessToken);
      setRefreshToken(response.refreshToken);
      setUser(response.user);
      setIsAuthenticated(true);
      
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      return response;
    } catch (error) {
      throw error;
    }
  };

  const signup = async (name, email, password) => {
    try {
      const response = await authApi.signup(name, email, password);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setAccessToken(null);
      setRefreshToken(null);
      setIsAuthenticated(false);
      
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      navigate('/login');
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const updatedUser = await authApi.updateProfile(profileData);
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    } catch (error) {
      throw error;
    }
  };

  const refreshAccessToken = async () => {
    try {
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      const tokens = await authApi.refreshToken(refreshToken);
      setAccessToken(tokens.accessToken);
      setRefreshToken(tokens.refreshToken);
      
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      
      return tokens.accessToken;
    } catch (error) {
      logout();
      throw error;
    }
  };

  const value = {
    user,
    accessToken,
    refreshToken,
    loading,
    isAuthenticated,
    login,
    signup,
    logout,
    updateProfile,
    refreshAccessToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
