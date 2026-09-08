import axiosInstance from "./axios";

export const createAgentApi = (data) => {
  return axiosInstance.post("/users/agents", data);
};

export const getAllUsersApi = (params) => {
  return axiosInstance.get("/users", { params });
};

export const getUserByIdApi = (id) => {
  return axiosInstance.get(`/users/${id}`);
};

export const updateUserStatusApi = (id, data) => {
  return axiosInstance.put(`/users/${id}/status`, data);
};

export const createCustomerProfileApi = (data) => {
  return axiosInstance.post("/customers/profile", data);
};

export const getOwnCustomerProfileApi = () => {
  return axiosInstance.get("/customers/profile");
};

export const updateOwnCustomerProfileApi = (data) => {
  return axiosInstance.put("/customers/profile", data);
};

export const getCustomerByIdApi = (customerId) => {
  return axiosInstance.get(`/customers/${customerId}`);
};

export const getCustomersApi = (params) => {
  // Used by admin/agent to search & list customers (e.g. the customer picker
  // when issuing a policy), so they never need to know a raw customer ID.
  return axiosInstance.get("/customers", { params });
};
