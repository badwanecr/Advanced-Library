import axios from "axios";

export const axiosInstance = axios.create();

// attach the latest token on every request (not just once at import time)
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
