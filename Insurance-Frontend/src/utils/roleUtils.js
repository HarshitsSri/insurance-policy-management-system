export const ROLES = {
  ADMIN: "ADMIN",
  AGENT: "AGENT",
  CUSTOMER: "CUSTOMER",
};

export const getDashboardPath = (role) => {
  switch (role) {
    case ROLES.ADMIN:
      return "/admin/dashboard";
    case ROLES.AGENT:
      return "/agent/dashboard";
    default:
      return "/customer/dashboard";
  }
};

export const roleLabel = (role) => {
  switch (role) {
    case ROLES.ADMIN:
      return "Administrator";
    case ROLES.AGENT:
      return "Insurance Officer";
    case ROLES.CUSTOMER:
      return "Customer";
    default:
      return role || "";
  }
};
