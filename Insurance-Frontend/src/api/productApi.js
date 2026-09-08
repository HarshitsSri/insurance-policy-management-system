import axiosInstance from "./axios";

export const createProductApi = (data) => {
  return axiosInstance.post("/products", data);
};

export const updateProductApi = (id, data) => {
  return axiosInstance.put(`/products/${id}`, data);
};

export const updateProductStatusApi = (id, active) => {
  return axiosInstance.patch(`/products/${id}/status`, { active });
};

export const getProductByIdApi = (id) => {
  return axiosInstance.get(`/products/${id}`);
};

export const getProductsApi = (params) => {
  return axiosInstance.get("/products", { params });
};

export const createPlanApi = (data) => {
  return axiosInstance.post("/plans", data);
};

export const updatePlanApi = (id, data) => {
  return axiosInstance.put(`/plans/${id}`, data);
};

export const updatePlanStatusApi = (id, active) => {
  return axiosInstance.patch(`/plans/${id}/status`, null, {
    params: { active },
  });
};

export const getPlanByIdApi = (id) => {
  return axiosInstance.get(`/plans/${id}`);
};

export const getPlansApi = (params) => {
  return axiosInstance.get("/plans", { params });
};
