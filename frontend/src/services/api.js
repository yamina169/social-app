// src/services/api.js
import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:3000", // ← ton backend
});

// Interceptor pour ajouter automatiquement le token à chaque requête
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
