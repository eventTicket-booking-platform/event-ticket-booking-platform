"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useSnackbar } from "@/components/ui/snackbar";
import { api } from "@/lib/api";
import { ApiError } from "@/lib/api/errors";

export default function VerifyEmailPage() {
  const router = useRouter();
  const snackbar = useSnackbar();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailFromQuery = params.get("email");
    if (emailFromQuery) {
      setEmail(emailFromQuery);
    }
  }, []);

  const emailValid = useMemo(() => email.includes("@"), [email]);
  const otpValid = useMemo(() => otp.trim().length >= 4, [otp]);

  async function handleVerifyEmail() {
    if (!emailValid || !otpValid || loading) {
      return;
    }

    try {
      setLoading(true);
      await api.auth.verifyEmail({ email, otp });
      snackbar.success("Email verified successfully. Please sign in.");
      router.push("/login");
    } catch (err) {
      snackbar.error(err instanceof ApiError ? err.message : "Invalid OTP.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResendOtp() {
    if (!emailValid || loading) {
      return;
    }

    try {
      setLoading(true);
      await api.auth.resendOtp({ email, type: "SIGNUP" });
      snackbar.success("A new OTP has been sent to your email.");
    } catch (err) {
      snackbar.error(err instanceof ApiError ? err.message : "Unable to resend OTP.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-12rem)] w-full max-w-7xl items-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid w-full gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-5">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/45">Verify Email</p>
          <h1 className="text-4xl font-semibold tracking-tight text-white">Complete your account verification.</h1>
          <p className="max-w-lg text-sm leading-7 text-white/62">
            Enter the OTP sent to your email address to activate your account.
          </p>
          <div className="flex items-center gap-3 text-xs text-white/55">
            <span className="text-white">1. Register</span>
            <span>/</span>
            <span className="text-white">2. Verify Email</span>
            <span>/</span>
            <span>3. Sign In</span>
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
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-white/65">OTP Code</label>
              <Input
                value={otp}
                onChange={(event) => setOtp(event.target.value)}
                placeholder="Enter the code from your email"
              />
            </div>

            <button
              type="button"
              className="w-full rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:opacity-50"
              disabled={!emailValid || !otpValid || loading}
              onClick={() => void handleVerifyEmail()}
            >
              {loading ? "Verifying..." : "Verify Email"}
            </button>

            <button
              type="button"
              className="w-full rounded-full border border-white/15 bg-transparent px-5 py-3 text-sm font-semibold text-white/85 transition hover:bg-white/10 disabled:opacity-50"
              disabled={!emailValid || loading}
              onClick={() => void handleResendOtp()}
            >
              Resend OTP
            </button>

            <p className="text-sm text-white/55">
              Already verified?{" "}
              <Link href="/login" className="font-semibold text-white">
                Sign in
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </main>
  );
}
