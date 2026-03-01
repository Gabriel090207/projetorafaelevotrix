import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  const empresaId = localStorage.getItem("empresa_id");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (empresaId) {
    config.headers["X-Empresa-Id"] = empresaId;
  }

  return config;
});

export default api;
