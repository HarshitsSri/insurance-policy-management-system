import { createContext, useEffect, useState } from "react";
import { getEmail, getRole, getToken, isTokenValid } from "../utils/tokenUtils";

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isTokenValid()) {
      setUser({
        email: getEmail(),
        role: getRole(),
        token: getToken(),
      });
    }
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
