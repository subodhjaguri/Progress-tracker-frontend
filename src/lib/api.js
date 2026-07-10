import axios from "axios";
import { getToken, clearToken } from "./token.js";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api/v1",
});

// Attach the bearer token on every request.
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On 401, drop the token and let the app fall back to the login screen.
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      clearToken();
      window.dispatchEvent(new Event("pt:unauthorized"));
    }
    return Promise.reject(error);
  },
);

/** Unwrap the standard { data, meta } success envelope. */
export const unwrap = (res) => res.data?.data;

/** Pull a human-readable message out of an axios error. */
export const errMessage = (error, fallback = "Something went wrong") => {
  const apiError = error?.response?.data?.error;
  // Validation errors carry the real, per-field messages under `details`; the
  // top-level message is only a generic label ("Validation failed"). Surface the
  // specific messages when they're present so the user sees what to fix.
  if (Array.isArray(apiError?.details)) {
    const messages = apiError.details.map((d) => d?.message).filter(Boolean);
    if (messages.length) return messages.join("\n");
  }
  return apiError?.message || error?.message || fallback;
};
