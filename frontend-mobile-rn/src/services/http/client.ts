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

// Module-level callback registered by AuthContext to handle session expiry
let _unauthorizedHandler: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null): void {
  _unauthorizedHandler = handler;
}

// Module-level callback registered by NetworkProvider to track connectivity
let _networkStatusHandler: ((online: boolean) => void) | null = null;

export function setNetworkStatusHandler(handler: ((online: boolean) => void) | null): void {
  _networkStatusHandler = handler;
}

httpClient.interceptors.response.use(
  (response) => {
    _networkStatusHandler?.(true);
    return response;
  },
  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      if (
        error.response?.status === 401 &&
        !error.config?.url?.includes("/auth/logout")
      ) {
        _unauthorizedHandler?.();
      }
      // No response means network unreachable (offline)
      _networkStatusHandler?.(Boolean(error.response));
    }
    return Promise.reject(error);
  }
);
