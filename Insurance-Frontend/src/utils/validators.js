// Shared validation rules for auth forms (Register, Login, VerifyOtp).
// Each function returns an error string, or "" when the value is valid.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Indian mobile numbers: optional +91 / 91 prefix, then a 10-digit number
// starting 6-9 (TRAI numbering plan for mobile).
const MOBILE_RE = /^(?:\+91|91)?[6-9]\d{9}$/;

export const validateFullName = (value) => {
  const v = value.trim();
  if (!v) return "Full name is required.";
  if (v.length < 3) return "Full name must be at least 3 characters.";
  if (v.length > 80) return "Full name must be under 80 characters.";
  if (!/^[A-Za-z.\s'-]+$/.test(v)) return "Full name can only contain letters and spaces.";
  return "";
};

export const validateEmail = (value) => {
  const v = value.trim();
  if (!v) return "Email is required.";
  if (!EMAIL_RE.test(v)) return "Enter a valid email address.";
  return "";
};

export const validatePassword = (value) => {
  if (!value) return "Password is required.";
  if (value.length < 8) return "Password must be at least 8 characters.";
  if (!/[A-Z]/.test(value)) return "Include at least one uppercase letter.";
  if (!/[a-z]/.test(value)) return "Include at least one lowercase letter.";
  if (!/[0-9]/.test(value)) return "Include at least one number.";
  return "";
};

export const validateMobileNumber = (value) => {
  const v = value.trim().replace(/[\s-]/g, "");
  if (!v) return "Mobile number is required.";
  if (!MOBILE_RE.test(v)) return "Enter a valid 10-digit mobile number.";
  return "";
};

export const validateOtp = (value) => {
  const v = value.trim();
  if (!v) return "Enter the OTP sent to you.";
  if (!/^\d{6}$/.test(v)) return "OTP must be exactly 6 digits.";
  return "";
};

// Runs a map of {field: validatorFn} against a values object and returns
// an errors object containing only the fields that failed.
export const runValidators = (values, validators) => {
  const errors = {};
  for (const field of Object.keys(validators)) {
    const message = validators[field](values[field] ?? "");
    if (message) errors[field] = message;
  }
  return errors;
};

export const hasErrors = (errors) => Object.keys(errors).length > 0;
