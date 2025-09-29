import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8080",
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