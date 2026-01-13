import axios from "axios";

// Configuración base
axios.defaults.baseURL = "http://127.0.0.1:8000";
axios.defaults.withCredentials = true;

axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // 1. Borramos el token que ya no sirve
      localStorage.removeItem("token");

      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axios;
