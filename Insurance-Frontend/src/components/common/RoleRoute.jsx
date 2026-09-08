import { Navigate } from "react-router-dom";
import { getDashboardPath } from "../../utils/roleUtils";

export default function RoleRoute({ allowedRole, children }) {
  const role = localStorage.getItem("role");

  if (role !== allowedRole) {
    return <Navigate to={getDashboardPath(role)} replace />;
  }

  return children;
}
