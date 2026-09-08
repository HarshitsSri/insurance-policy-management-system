import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Lock, ArrowRight, ShieldHalf, AlertTriangle } from "lucide-react";
import { toast } from "react-toastify";

import { resetPasswordApi } from "../../api/authApi";
import AuthShell from "../../components/layout/AuthShell";
import Button from "../../components/ui/Button";
import { Field, Input } from "../../components/ui/FormControls";
import { getErrorMessage } from "../../utils/format";
import { validatePassword } from "../../utils/validators";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [formData, setFormData] = useState({ newPassword: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const validate = () => {
    const nextErrors = {};

    const passwordError = validatePassword(formData.newPassword);
    if (passwordError) nextErrors.newPassword = passwordError;

    if (!formData.confirmPassword) {
      nextErrors.confirmPassword = "Please confirm your new password.";
    } else if (formData.newPassword !== formData.confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error("This reset link is invalid or missing a token.");
      return;
    }

    if (!validate()) {
      toast.error("Please fix the highlighted fields before continuing.");
      return;
    }

    setLoading(true);

    try {
      await resetPasswordApi({
        token,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      });
      toast.success("Password reset successfully! You can now log in.");
      navigate("/login", { replace: true });
    } catch (error) {
      toast.error(getErrorMessage(error, "This reset link is invalid or has expired."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      panelTitle={<>Set a new<br /> password.</>}
      panelSubtitle="Choose a strong password to keep your policies and claims secure."
    >
      <div className="mb-8 flex items-center gap-2.5 lg:hidden">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink-900 text-amber-300">
          <ShieldHalf size={20} strokeWidth={2.25} />
        </div>
        <span className="font-display text-lg font-bold text-ink-900">Insurance CRM</span>
      </div>

      {!token ? (
        <>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
            <AlertTriangle size={22} />
          </div>
          <h1 className="mt-4 font-display text-[28px] font-bold text-ink-900">Invalid reset link</h1>
          <p className="mt-2 text-sm text-ink-400">
            This password reset link is missing or malformed. Please request a new one.
          </p>
          <Link to="/forgot-password">
            <Button type="button" variant="accent" size="lg" className="mt-8 w-full">
              Request a new link
            </Button>
          </Link>
        </>
      ) : (
        <>
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">
            Reset password
          </p>
          <h1 className="mt-1 font-display text-[28px] font-bold text-ink-900">
            Choose a new password
          </h1>
          <p className="mt-2 text-sm text-ink-400">
            Your new password must be at least 8 characters and include an uppercase letter, a
            lowercase letter, and a number.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <Field label="New password" htmlFor="newPassword" required error={errors.newPassword}>
              <Input
                id="newPassword"
                type="password"
                name="newPassword"
                placeholder="••••••••"
                icon={Lock}
                required
                error={errors.newPassword}
                value={formData.newPassword}
                onChange={handleChange}
              />
            </Field>

            <Field
              label="Confirm new password"
              htmlFor="confirmPassword"
              required
              error={errors.confirmPassword}
            >
              <Input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                placeholder="••••••••"
                icon={Lock}
                required
                error={errors.confirmPassword}
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </Field>

            <Button
              type="submit"
              variant="accent"
              size="lg"
              className="w-full"
              loading={loading}
              icon={ArrowRight}
              iconPosition="right"
            >
              Reset password
            </Button>
          </form>
        </>
      )}

      <p className="mt-7 text-center text-sm text-ink-500">
        Remembered your password?{" "}
        <Link to="/login" className="font-semibold text-ink-900 hover:text-amber-600">
          Back to sign in
        </Link>
      </p>
    </AuthShell>
  );
}
