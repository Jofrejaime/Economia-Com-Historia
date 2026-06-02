import axios from "axios";
import { APP_CONFIG } from "../../constants/config";
import { getAuthToken } from "./tokenManager";

export const httpClient = axios.create({
  baseURL: APP_CONFIG.apiBaseUrl,
  timeout: APP_CONFIG.requestTimeoutMs,
});

httpClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
