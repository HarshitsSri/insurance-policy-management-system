import { jwtDecode } from "jwt-decode";

export const getToken = () => {
  return localStorage.getItem("token");
};

export const getRole = () => {
  return localStorage.getItem("role");
};

export const getEmail = () => {
  return localStorage.getItem("email");
};

export const isTokenValid = () => {

  const token = getToken();

  if (!token) return false;

  try {

    const decoded = jwtDecode(token);

    return decoded.exp * 1000 > Date.now();

  } catch {

    return false;
  }
};

export const clearAuth = () => {

  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("email");
};