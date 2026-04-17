"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useSnackbar } from "@/components/ui/snackbar";
import { api } from "@/lib/api";
import { ApiError } from "@/lib/api/errors";

type Step = 1 | 2 | 3;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const snackbar = useSnackbar();

  const [step, setStep] = useState<Step>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const emailValid = useMemo(() => email.includes("@"), [email]);
  const otpValid = useMemo(() => otp.trim().length >= 4, [otp]);
  const passwordValid = useMemo(() => newPassword.length >= 6, [newPassword]);
  const passwordsMatch = useMemo(() => newPassword === confirmPassword, [newPassword, confirmPassword]);

  async function handleRequestOtp() {
    if (!emailValid || loading) {
      return;
    }

    try {
      setLoading(true);
      await api.auth.requestPasswordReset({ email });
      snackbar.success("OTP sent to your email.");
      setStep(2);
    } catch (err) {
      snackbar.error(err instanceof ApiError ? err.message : "Unable to send reset OTP.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp() {
    if (!otpValid || loading) {
      return;
    }

    try {
      setLoading(true);
      await api.auth.verifyPasswordReset({ email, otp });
      snackbar.success("OTP verified.");
      setStep(3);
    } catch (err) {
      snackbar.error(err instanceof ApiError ? err.message : "Invalid OTP.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword() {
    if (!passwordValid || !passwordsMatch || loading) {
      return;
    }

    try {
      setLoading(true);
      await api.auth.resetPassword({
        email,
        password: newPassword,
        code: otp,
      });
      snackbar.success("Password reset successful. Please sign in.");
      router.push("/login");
    } catch (err) {
      snackbar.error(err instanceof ApiError ? err.message : "Unable to reset password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-12rem)] w-full max-w-7xl items-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid w-full gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-5">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/45">Account Recovery</p>
          <h1 className="text-4xl font-semibold tracking-tight text-white">Reset your password securely.</h1>
          <p className="max-w-lg text-sm leading-7 text-white/62">
            Request OTP, verify it, then set a new password.
          </p>
          <div className="flex items-center gap-3 text-xs text-white/55">
            <span className={step >= 1 ? "text-white" : ""}>1. Email</span>
            <span>/</span>
            <span className={step >= 2 ? "text-white" : ""}>2. OTP</span>
            <span>/</span>
            <span className={step >= 3 ? "text-white" : ""}>3. New Password</span>
          </div>
        </div>

        <Card className="p-8">
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm text-white/65">Email</label>
              <Input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                disabled={step > 1}
              />
            </div>

            {step === 1 ? (
              <button
                type="button"
                className="w-full rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:opacity-50"
                disabled={!emailValid || loading}
                onClick={() => void handleRequestOtp()}
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>
            ) : null}

            {step >= 2 ? (
              <div className="space-y-2">
                <label className="text-sm text-white/65">OTP Code</label>
                <Input value={otp} onChange={(event) => setOtp(event.target.value)} disabled={step > 2} />
              </div>
            ) : null}

            {step === 2 ? (
              <div className="space-y-3">
                <button
                  type="button"
                  className="w-full rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:opacity-50"
                  disabled={!otpValid || loading}
                  onClick={() => void handleVerifyOtp()}
                >
                  {loading ? "Verifying OTP..." : "Verify OTP"}
                </button>
                <button
                  type="button"
                  className="w-full rounded-full border border-white/15 bg-transparent px-5 py-3 text-sm font-semibold text-white/85 transition hover:bg-white/10 disabled:opacity-50"
                  disabled={loading}
                  onClick={() => void handleRequestOtp()}
                >
                  Resend OTP
                </button>
              </div>
            ) : null}

            {step === 3 ? (
              <>
                <div className="space-y-2">
                  <label className="text-sm text-white/65">New Password</label>
                  <Input
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    type="password"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-white/65">Confirm Password</label>
                  <Input
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    type="password"
                  />
                </div>
                {!passwordsMatch ? (
                  <p className="text-xs text-red-300">Passwords do not match.</p>
                ) : null}
                <button
                  type="button"
                  className="w-full rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:opacity-50"
                  disabled={!passwordValid || !passwordsMatch || loading}
                  onClick={() => void handleResetPassword()}
                >
                  {loading ? "Resetting Password..." : "Reset Password"}
                </button>
              </>
            ) : null}

            <p className="text-sm text-white/55">
              Remembered your password?{" "}
              <Link href="/login" className="font-semibold text-white">
                Back to sign in
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </main>
  );
}
