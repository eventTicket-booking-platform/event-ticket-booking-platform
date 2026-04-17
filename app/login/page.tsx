"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useSnackbar } from "@/components/ui/snackbar";
import { api } from "@/lib/api";
import { ApiError } from "@/lib/api/errors";
import { setStoredAuthSession } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const snackbar = useSnackbar();

  const isValid = email.includes("@") && password.length >= 6;

  return (
    <main className="mx-auto flex min-h-[calc(100vh-12rem)] w-full max-w-7xl items-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid w-full gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-5">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/45">Sign In</p>
          <h1 className="text-4xl font-semibold tracking-tight text-white">Access your bookings and upcoming events.</h1>
          <p className="max-w-lg text-sm leading-7 text-white/62">
            This page now authenticates against the auth service through the gateway and stores the access token locally.
          </p>
        </div>
        <Card className="p-8">
          <form
            className="space-y-5"
            onSubmit={async (event) => {
              event.preventDefault();
              if (!isValid || loading) {
                return;
              }

              try {
                setLoading(true);
                const response = await api.auth.login({ email, password });
                setStoredAuthSession(response.data.access_token, response.data.refresh_token);
                snackbar.success("Signed in successfully.");
                router.push("/dashboard");
              } catch (err) {
                snackbar.error(err instanceof ApiError ? err.message : "Unable to sign in");
              } finally {
                setLoading(false);
              }
            }}
          >
            <div className="space-y-2">
              <label className="text-sm text-white/65">Email</label>
              <Input value={email} onChange={(event) => setEmail(event.target.value)} type="email" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-white/65">
                <label>Password</label>
                <div className="flex items-center gap-4">
                  <Link href="/forgot-password" className="text-white/65 hover:text-white">
                    Forgot Password?
                  </Link>
                  <button type="button" className="text-white/55" onClick={() => setShowPassword((value) => !value)}>
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
              <Input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type={showPassword ? "text" : "password"}
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:opacity-50"
              disabled={!isValid || loading}
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
            <p className="text-sm text-white/55">
              New here?{" "}
              <Link href="/register" className="font-semibold text-white">
                Create an account
              </Link>
            </p>
          </form>
        </Card>
      </div>
    </main>
  );
}
