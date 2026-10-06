import axios from "axios";

export const API = "http://localhost:8080/api";

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