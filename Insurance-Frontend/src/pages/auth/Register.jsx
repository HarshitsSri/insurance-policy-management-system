import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User, Mail, Lock, Phone, ArrowRight, ShieldHalf } from "lucide-react";
import { toast } from "react-toastify";

import { registerApi } from "../../api/authApi";
import AuthShell from "../../components/layout/AuthShell";
import Button from "../../components/ui/Button";
import { Field, Input } from "../../components/ui/FormControls";
import { getErrorMessage } from "../../utils/format";
import {
  validateFullName,
  validateEmail,
  validatePassword,
  validateMobileNumber,
  runValidators,
  hasErrors,
} from "../../utils/validators";

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    mobileNumber: "",
  });
  const [otpChannel, setOtpChannel] = useState("EMAIL");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validators = {
    fullName: validateFullName,
    email: validateEmail,
    password: validatePassword,
    mobileNumber: validateMobileNumber,
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear the field's error as soon as the user starts correcting it.
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const message = validators[name] ? validators[name](value) : "";
    setErrors((prev) => ({ ...prev, [name]: message }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const fieldErrors = runValidators(formData, validators);
    setErrors(fieldErrors);

    if (hasErrors(fieldErrors)) {
      toast.error("Please fix the highlighted fields before continuing.");
      return;
    }

    setLoading(true);

    try {
      await registerApi({ ...formData, otpChannel });

      // Store whichever identifier was used so VerifyOtp knows how to display & verify
      localStorage.setItem("otpChannel", otpChannel);
      if (otpChannel === "PHONE") {
        localStorage.setItem("verificationPhone", formData.mobileNumber);
        toast.success("OTP sent to your phone. Please verify to continue.");
      } else {
        localStorage.setItem("verificationEmail", formData.email);
        toast.success("OTP sent to your email. Please verify to continue.");
      }

      navigate("/verify-otp");
    } catch (error) {
      toast.error(getErrorMessage(error, "Registration failed. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      panelTitle={<>Get covered in minutes,<br /> not paperwork.</>}
      panelSubtitle="Create your customer account to browse plans, purchase policies and track claims online."
    >
      <div className="mb-8 flex items-center gap-2.5 lg:hidden">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink-900 text-amber-300">
          <ShieldHalf size={20} strokeWidth={2.25} />
        </div>
        <span className="font-display text-lg font-bold text-ink-900">Insurance CRM</span>
      </div>

      <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">Get started</p>
      <h1 className="mt-1 font-display text-[28px] font-bold text-ink-900">Create your account</h1>
      <p className="mt-2 text-sm text-ink-400">Sign up as a customer to start exploring insurance plans.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <Field label="Full name" htmlFor="fullName" required error={errors.fullName}>
          <Input
            id="fullName"
            type="text"
            name="fullName"
            placeholder="Jordan Mehta"
            icon={User}
            required
            error={errors.fullName}
            value={formData.fullName}
            onChange={handleChange}
            onBlur={handleBlur}
          />
        </Field>

        <Field label="Email address" htmlFor="email" required error={errors.email}>
          <Input
            id="email"
            type="email"
            name="email"
            placeholder="you@example.com"
            icon={Mail}
            required
            error={errors.email}
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
          />
        </Field>

        <Field
          label="Password"
          htmlFor="password"
          required
          error={errors.password}
          hint={errors.password ? undefined : "At least 8 characters, with uppercase, lowercase and a number."}
        >
          <Input
            id="password"
            type="password"
            name="password"
            placeholder="••••••••"
            icon={Lock}
            required
            minLength={8}
            error={errors.password}
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
          />
        </Field>

        <Field label="Mobile number" htmlFor="mobileNumber" required error={errors.mobileNumber}>
          <Input
            id="mobileNumber"
            type="tel"
            name="mobileNumber"
            placeholder="98765 43210"
            icon={Phone}
            required
            error={errors.mobileNumber}
            value={formData.mobileNumber}
            onChange={handleChange}
            onBlur={handleBlur}
          />
        </Field>

        {/* OTP Channel selector */}
        <Field label="Send OTP via" htmlFor="otpChannel" required>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: "EMAIL", label: "Email", icon: Mail },
              { value: "PHONE", label: "Phone (SMS)", icon: Phone },
            ].map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setOtpChannel(value)}
                className={`flex items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-medium transition
                  ${otpChannel === value
                    ? "border-ink-900 bg-ink-900 text-white"
                    : "border-ink-200 bg-white text-ink-500 hover:border-ink-400 hover:text-ink-700"
                  }`}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </div>
        </Field>

        <Button type="submit" variant="accent" size="lg" className="w-full" loading={loading} icon={ArrowRight} iconPosition="right">
          Create account
        </Button>
      </form>

      <p className="mt-7 text-center text-sm text-ink-500">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-ink-900 hover:text-amber-600">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
