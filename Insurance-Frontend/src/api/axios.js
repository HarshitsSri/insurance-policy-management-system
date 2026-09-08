import axios from "axios";
import { clearAuth, getToken } from "../utils/tokenUtils";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8080/api",
});

const publicUrls = [
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password"
];
axiosInstance.interceptors.request.use((config) => {
  const token = getToken();

 if (
    token &&
    !publicUrls.some(url => config.url?.includes(url))
  ) {
    config.headers.Authorization = `Bearer ${token}`;
  }


  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    if (status === 401 || status === 403) {
      clearAuth();

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
