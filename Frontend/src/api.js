import axios from "axios";

// In production set VITE_API_URL (example: https://api.yourdomain.com)
export const API_ORIGIN = import.meta.env.VITE_API_URL || "http://localhost:8080";
export const API = `${API_ORIGIN}/api`;

// uploaded photos are served by the backend; bundled photos by the frontend
export const imageSrc = (url) =>
  url && url.startsWith("/uploads/") ? `${API_ORIGIN}${url}` : url;

const api = axios.create({ baseURL: API });

// every request: token irundha Authorization header-ah add pannum
api.interceptors.request.use((config) => {
  const saved = localStorage.getItem("auth");
  if (saved) {
    try {
      const { token } = JSON.parse(saved);
      if (token) config.headers.Authorization = `Bearer ${token}`;
    } catch {
      // broken storage: ignore
    }
  }
  return config;
});

export default api;