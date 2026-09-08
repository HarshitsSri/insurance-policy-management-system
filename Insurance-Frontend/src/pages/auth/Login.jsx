import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, ArrowRight, ShieldHalf } from "lucide-react";
import { toast } from "react-toastify";

import { loginApi } from "../../api/authApi";
import AuthShell from "../../components/layout/AuthShell";
import Button from "../../components/ui/Button";
import { Field, Input } from "../../components/ui/FormControls";
import { getErrorMessage } from "../../utils/format";
import { getDashboardPath } from "../../utils/roleUtils";
import { useAuth } from "../../hooks/useAuth";
import { validateEmail } from "../../utils/validators";

export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    if (name === "email") {
      setErrors((prev) => ({ ...prev, email: validateEmail(value) }));
    }
    if (name === "password" && !value) {
      setErrors((prev) => ({ ...prev, password: "Password is required." }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailError = validateEmail(formData.email);
    const passwordError = formData.password ? "" : "Password is required.";

    if (emailError || passwordError) {
      setErrors({ email: emailError, password: passwordError });
      toast.error("Please fix the highlighted fields before continuing.");
      return;
    }

    setLoading(true);

    try {
      const response = await loginApi(formData);
      const data = response.data;

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("email", data.email);

      setUser({ email: data.email, role: data.role, token: data.token });

      toast.success(`Welcome back, ${data.email.split("@")[0]}!`);
      navigate(getDashboardPath(data.role), { replace: true });
    } catch (error) {
      toast.error(getErrorMessage(error, "Invalid email or password."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <div className="mb-8 flex items-center gap-2.5 lg:hidden">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink-900 text-amber-300">
          <ShieldHalf size={20} strokeWidth={2.25} />
        </div>
        <span className="font-display text-lg font-bold text-ink-900">Insurance CRM</span>
      </div>

      <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">Welcome back</p>
      <h1 className="mt-1 font-display text-[28px] font-bold text-ink-900">Sign in to your account</h1>
      <p className="mt-2 text-sm text-ink-400">
        Enter your credentials to access your policies, claims and payments.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
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

        <Field label="Password" htmlFor="password" required error={errors.password}>
          <Input
            id="password"
            type="password"
            name="password"
            placeholder="••••••••"
            icon={Lock}
            required
            error={errors.password}
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
          />
        </Field>

        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-sm font-semibold text-ink-500 hover:text-amber-600">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" variant="accent" size="lg" className="w-full" loading={loading} icon={ArrowRight} iconPosition="right">
          Sign in
        </Button>
      </form>

      <p className="mt-7 text-center text-sm text-ink-500">
        New to Insurance CRM?{" "}
        <Link to="/register" className="font-semibold text-ink-900 hover:text-amber-600">
          Create an account
        </Link>
      </p>

     
    </AuthShell>
  );
}
