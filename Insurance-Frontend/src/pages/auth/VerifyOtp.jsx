import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ShieldHalf, ArrowRight, MailCheck, MessageCircle } from "lucide-react";
import { toast } from "react-toastify";

import { verifyOtpApi } from "../../api/authApi";
import AuthShell from "../../components/layout/AuthShell";
import Button from "../../components/ui/Button";
import { getErrorMessage } from "../../utils/format";
import { validateOtp } from "../../utils/validators";

export default function VerifyOtp() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpError, setOtpError] = useState("");

  const otpChannel = localStorage.getItem("otpChannel") || "EMAIL";
  const isPhone = otpChannel === "PHONE";

  const email = localStorage.getItem("verificationEmail");
  const phone = localStorage.getItem("verificationPhone");
  const identifier = isPhone ? phone : email;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!identifier) {
      toast.error("We couldn't find your registration details. Please sign up again.");
      return;
    }

    const message = validateOtp(otp);
    if (message) {
      setOtpError(message);
      toast.error(message);
      return;
    }

    setLoading(true);

    try {
      // Send the correct identifier field based on chosen channel
      const payload = isPhone
        ? { mobileNumber: phone, otp }
        : { email, otp };

      await verifyOtpApi(payload);

      toast.success("OTP verified successfully! You can now log in.");
      localStorage.removeItem("verificationEmail");
      localStorage.removeItem("verificationPhone");
      localStorage.removeItem("otpChannel");
      navigate("/login");
    } catch (error) {
      toast.error(getErrorMessage(error, "OTP verification failed."));
    } finally {
      setLoading(false);
    }
  };

  const IconComp = isPhone ? MessageCircle : MailCheck;

  return (
    <AuthShell
      panelTitle={<>One last step<br /> to secure your account.</>}
      panelSubtitle="We use a one-time code to confirm it's really you before activating your profile."
    >
      <div className="mb-8 flex items-center gap-2.5 lg:hidden">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink-900 text-amber-300">
          <ShieldHalf size={20} strokeWidth={2.25} />
        </div>
        <span className="font-display text-lg font-bold text-ink-900">Insurance CRM</span>
      </div>

      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
        <IconComp size={22} />
      </div>

      <h1 className="mt-4 font-display text-[28px] font-bold text-ink-900">
        Verify your {isPhone ? "phone" : "email"}
      </h1>
      <p className="mt-2 text-sm text-ink-400">
        Enter the 6-digit code we sent to{" "}
        <span className="font-semibold text-ink-700">{identifier || (isPhone ? "your phone" : "your email")}</span>.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="••••••"
            value={otp}
            onChange={(e) => {
              setOtp(e.target.value.replace(/\D/g, ""));
              if (otpError) setOtpError("");
            }}
            className={`w-full rounded-xl border bg-white py-4 text-center text-2xl font-bold tracking-[0.5em] text-ink-900 outline-none transition focus:ring-2 ${
              otpError
                ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100"
                : "border-ink-200 focus:border-ink-400 focus:ring-ink-100"
            }`}
            required
          />
          {otpError && <p className="mt-1.5 text-center text-xs font-medium text-rose-600">{otpError}</p>}
        </div>

        <Button type="submit" variant="accent" size="lg" className="w-full" loading={loading} icon={ArrowRight} iconPosition="right">
          Verify &amp; continue
        </Button>
      </form>

      <p className="mt-7 text-center text-sm text-ink-500">
        Wrong {isPhone ? "number" : "email"}?{" "}
        <Link to="/register" className="font-semibold text-ink-900 hover:text-amber-600">
          Go back to sign up
        </Link>
      </p>
    </AuthShell>
  );
}
