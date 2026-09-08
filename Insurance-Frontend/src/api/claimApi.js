import axiosInstance from "./axios";

export const raiseClaimApi = (data) => {
  return axiosInstance.post("/claims", data);
};

export const reviewClaimApi = (id, data) => {
  return axiosInstance.put(`/claims/${id}/review`, data);
};

export const finalDecisionApi = (id, data) => {
  return axiosInstance.put(`/claims/${id}/decision`, data);
};

export const getClaimByIdApi = (id) => {
  return axiosInstance.get(`/claims/${id}`);
};

export const getMyClaimsApi = (params) => {
  return axiosInstance.get("/claims/my", { params });
};

export const getAllClaimsApi = (params) => {
  return axiosInstance.get("/claims", { params });
};

export const getClaimHistoryApi = (claimId, params) => {
  return axiosInstance.get(`/history/claim/${claimId}`, { params });
};

export const uploadClaimDocumentApi = (file, documentName, documentType) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("documentName", documentName);
  formData.append("documentType", documentType);

  return axiosInstance.post("/claim-documents/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
