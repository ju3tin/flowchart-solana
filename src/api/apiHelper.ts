"use client";

import axios, { AxiosInstance } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9999';

const createApiInstance = (): AxiosInstance => {
  const api = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  api.interceptors.request.use(
    (config) => {
      // TEMPORARY: Authentication bypass - not setting token in requests
      
      /* ORIGINAL AUTH CODE - COMMENTED OUT TEMPORARILY
      const token = localStorage.getItem('token');
      if (token) config.headers['Authorization'] = `Bearer ${token}`;
      */
      return config;
    },
    (error) => { return Promise.reject(error); }
  );

  return api;
};

export const api = createApiInstance();