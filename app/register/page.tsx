"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useSnackbar } from "@/components/ui/snackbar";
import { api } from "@/lib/api";
import { ApiError } from "@/lib/api/errors";

const requirements = [
  { id: "length", label: "At least 6 characters", check: (value: string) => value.length >= 6 },
  { id: "upper", label: "One uppercase letter", check: (value: string) => /[A-Z]/.test(value) },
  { id: "number", label: "One number", check: (value: string) => /\d/.test(value) },
];

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    contact: "",
    password: "",
    confirmPassword: "",
    agree: false,
  });
  const [loading, setLoading] = useState(false);
  const snackbar = useSnackbar();

  const met = requirements.filter((item) => item.check(form.password)).length;
  const isValid =
    form.firstName &&
    form.lastName &&
    form.email.includes("@") &&
    met === requirements.length &&
    form.password === form.confirmPassword &&
    form.agree;

  return (
    <main className="mx-auto flex min-h-[calc(100vh-12rem)] w-full max-w-7xl items-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid w-full gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-5">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/45">Register</p>
          <h1 className="text-4xl font-semibold tracking-tight text-white">Create an account with the auth service.</h1>
          <p className="max-w-lg text-sm leading-7 text-white/62">
            Registration now submits directly to the backend signup API. Email verification is still required afterward.
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
                await api.auth.register({
                  firstName: form.firstName,
                  lastName: form.lastName,
                  email: form.email,
                  password: form.password,
                  contact: form.contact || undefined,
                });
                snackbar.success("Account created. Verify your email with the OTP.");
                router.push(`/verify-email?email=${encodeURIComponent(form.email)}`);
              } catch (err) {
                snackbar.error(err instanceof ApiError ? err.message : "Unable to register");
              } finally {
                setLoading(false);
              }
            }}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Input placeholder="First name" value={form.firstName} onChange={(event) => setForm((current) => ({ ...current, firstName: event.target.value }))} />
              <Input placeholder="Last name" value={form.lastName} onChange={(event) => setForm((current) => ({ ...current, lastName: event.target.value }))} />
            </div>
            <Input type="email" placeholder="Email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} />
            <Input placeholder="Contact (optional)" value={form.contact} onChange={(event) => setForm((current) => ({ ...current, contact: event.target.value }))} />
            <Input type="password" placeholder="Password" value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} />
            <Input type="password" placeholder="Confirm password" value={form.confirmPassword} onChange={(event) => setForm((current) => ({ ...current, confirmPassword: event.target.value }))} />
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="grid gap-2 text-sm">
                {requirements.map((item) => {
                  const passed = item.check(form.password);
                  return (
                    <p key={item.id} className={passed ? "text-emerald-300" : "text-white/45"}>
                      {item.label}
                    </p>
                  );
                })}
              </div>
            </div>
            <label className="flex items-start gap-3 text-sm text-white/58">
              <input type="checkbox" checked={form.agree} onChange={(event) => setForm((current) => ({ ...current, agree: event.target.checked }))} className="mt-1 accent-white" />
              <span>I agree to the terms of service and privacy policy.</span>
            </label>
            <button type="submit" disabled={!Boolean(isValid) || loading} className="w-full rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:opacity-50">
              {loading ? "Creating Account..." : "Create Account"}
            </button>
            <p className="text-sm text-white/55">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-white">
                Sign in
              </Link>
            </p>
          </form>
        </Card>
      </div>
    </main>
  );
}
