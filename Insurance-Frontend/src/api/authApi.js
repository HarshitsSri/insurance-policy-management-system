import axiosInstance from "./axios";

export const loginApi = (data) => {
  return axiosInstance.post("/auth/login", data);
};

export const registerApi = (data) => {
  return axiosInstance.post("/auth/register", data);
};

export const verifyOtpApi = (data) => {
  return axiosInstance.post("/auth/verify-otp", data);
};

export const forgotPasswordApi = (data) => {
  return axiosInstance.post("/auth/forgot-password", data);
};

export const resetPasswordApi = (data) => {
  return axiosInstance.post("/auth/reset-password", data);
};
