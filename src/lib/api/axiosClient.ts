import axios from "axios";

const axiosClient = axios.create({
  baseURL: "https://koi.eventzone.id.vn/api/v1/",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to include the JWT in the Authorization header
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("jwt");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor to handle errors
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  },
);

export default axiosClient;
