import axiosInstance from "./axios";

export const recordPaymentApi = (data) => {
  return axiosInstance.post("/payments", data);
};

export const getPaymentByIdApi = (paymentId) => {
  return axiosInstance.get(`/payments/${paymentId}`);
};

export const getMyPaymentsApi = (params) => {
  return axiosInstance.get("/payments/my-payments", { params });
};

export const getAllPaymentsApi = (params) => {
  return axiosInstance.get("/payments", { params });
};
