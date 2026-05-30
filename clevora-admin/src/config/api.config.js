const axios = require("axios");

const api = axios.create({
  baseURL: process.env.API_BASE_URL || "http://localhost:5000/api",
  timeout: 15000,
});

// Interceptor to attach admin token automatically to every backend request
api.interceptors.request.use(
  (config) => {
    if (global.adminToken) {
      config.headers.Authorization = `Bearer ${global.adminToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

module.exports = api;
