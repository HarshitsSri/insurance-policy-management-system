import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowRight, ShieldHalf, MailCheck } from "lucide-react";
import { toast } from "react-toastify";

import { forgotPasswordApi } from "../../api/authApi";
import AuthShell from "../../components/layout/AuthShell";
import Button from "../../components/ui/Button";
import { Field, Input } from "../../components/ui/FormControls";
import { getErrorMessage } from "../../utils/format";
import { validateEmail } from "../../utils/validators";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      toast.error(emailError);
      return;
    }

    setLoading(true);

    try {
      await forgotPasswordApi({ email: email.trim() });
      setSent(true);
    } catch (error) {
      toast.error(getErrorMessage(error, "Something went wrong. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      panelTitle={<>Forgot your<br /> password? No worries.</>}
      panelSubtitle="We'll email you a secure link to set a new password for your account."
    >
      <div className="mb-8 flex items-center gap-2.5 lg:hidden">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink-900 text-amber-300">
          <ShieldHalf size={20} strokeWidth={2.25} />
        </div>
        <span className="font-display text-lg font-bold text-ink-900">Insurance CRM</span>
      </div>

      {sent ? (
        <>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
            <MailCheck size={22} />
          </div>
          <h1 className="mt-4 font-display text-[28px] font-bold text-ink-900">Check your email</h1>
          <p className="mt-2 text-sm text-ink-400">
            If an account exists for{" "}
            <span className="font-semibold text-ink-700">{email.trim()}</span>, we've sent a
            password reset link to it. The link expires in 15 minutes.
          </p>

          <Button
            type="button"
            variant="outline"
            size="lg"
            className="mt-8 w-full"
            onClick={() => setSent(false)}
          >
            Use a different email
          </Button>
        </>
      ) : (
        <>
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">
            Reset password
          </p>
          <h1 className="mt-1 font-display text-[28px] font-bold text-ink-900">
            Forgot your password?
          </h1>
          <p className="mt-2 text-sm text-ink-400">
            Enter the email associated with your account and we'll send you a link to reset it.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <Field label="Email address" htmlFor="email" required error={error}>
              <Input
                id="email"
                type="email"
                name="email"
                placeholder="you@example.com"
                icon={Mail}
                required
                error={error}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError("");
                }}
                onBlur={(e) => setError(validateEmail(e.target.value))}
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
              Send reset link
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
