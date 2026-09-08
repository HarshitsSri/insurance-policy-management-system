import axiosInstance from "./axios";

export const purchasePolicyApi = (data) => {
  return axiosInstance.post("/policies/purchase", data);
};

export const issuePolicyApi = (data) => {
  return axiosInstance.post("/policies/issue", data);
};

export const getMyPoliciesApi = (params) => {
  return axiosInstance.get("/policies/my-policies", { params });
};

export const getAllPoliciesApi = (params) => {
  // Backend's /all-policies endpoint defaults sortBy to "id", but the Policy
  // entity's field is actually "policyId" — sorting by "id" throws a 500.
  // Always send a safe default unless the caller explicitly overrides it.
  return axiosInstance.get("/policies/all-policies", {
    params: { sortBy: "policyId", direction: "desc", ...params },
  });
};

export const getPolicyByIdApi = (policyId) => {
  return axiosInstance.get(`/policies/${policyId}`);
};

export const cancelPolicyApi = (policyId) => {
  return axiosInstance.put(`/policies/${policyId}/cancel`);
};
