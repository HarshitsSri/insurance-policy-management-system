import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AuthContext } from "../context/AuthContext";
import { clearAuth } from "../utils/tokenUtils";

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  const navigate = useNavigate();

  const logout = () => {
    clearAuth();
    ctx?.setUser(null);
    toast.info("You have been signed out.");
    navigate("/login", { replace: true });
  };

  return { ...ctx, logout };
};
