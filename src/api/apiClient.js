import axios from "axios";
import config from '../config/config';

const api = axios.create({
    baseURL: config.apiUrl,
    headers: {
        "Content-Type": "application/json"
    }
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  const type = localStorage.getItem("token_type") || "Bearer";
  if (token) {
    config.headers.Authorization = `${type} ${token}`;
  }
  return config;
});


export default api;