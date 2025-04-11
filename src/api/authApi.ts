"use client";

import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const authApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

authApi.interceptors.request.use(
  (config) => {
    // TEMPORARY: Authentication bypass - not setting token in request headers
    
    /* ORIGINAL AUTH CODE - COMMENTED OUT TEMPORARILY
    const token = Cookies.get('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    */
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const login = async (username: string, password: string) => {
  try {
    const response = await authApi.post('/auth/login', { username, password });
    
    if (response.data.token) {
      Cookies.set('token', response.data.token, {
        expires: 7,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
    }
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const register = async (
  organisation: string,
  username: string,
  password: string,
  code: string,
  openAiApiKey: string
): Promise<any> => {
  try {
    const response = await authApi.post('/auth/register', {
      organisation,
      username,
      password,
      code,
      openAiApiKey
    });

    if (response.data.token) {
      Cookies.set('token', response.data.token, {
        expires: 7,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
      console.log("token stored in cookie", response.data.token)
    }

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const logout = async () => {
  try {
    const response = await authApi.post('/auth/logout');
    console.log(response.data.message);
    Cookies.remove('token');
  } catch (error: any) {
    console.error('Error during logout:', error.response?.data || error.message);
    throw error;
  }
};

export const getUser = async () => {
  try {
    const response = await authApi.get('/auth/user');
    return response.data.user;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

export const updateApiKey = async (newApiKey: string): Promise<any> => {
  try {
    const response = await authApi.post('/auth/update-api-key', { apiKey: newApiKey });
    return response.data;
  } catch (error: any) {
    console.error('Error updating API key:', error.response?.data || error.message);
    throw error;
  }
};

export default authApi;
