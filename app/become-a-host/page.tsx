"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useSnackbar } from "@/components/ui/snackbar";
import { api, ApiError } from "@/lib/api";
import type { HostApplication } from "@/lib/api/types";
import { clearStoredAuthSession, getRealmRoles, getStoredAccessToken } from "@/lib/auth";

const hostDashboardUrl = process.env.NEXT_PUBLIC_HOST_DASHBOARD_URL?.trim();

function HostDashboardAction() {
  return (
    <div className="mt-6 space-y-4">
      <p className="text-sm leading-7 text-white/62">
        Sign in again to the shared Admin/Host dashboard to use your HOST access.
      </p>
      {hostDashboardUrl ? <ButtonLink href={hostDashboardUrl}>Open Host Dashboard</ButtonLink> : (
        <p className="text-sm text-white/62">Ask the platform administrator for the Host Dashboard URL.</p>
      )}
    </div>
  );
}

function isDashboardUser(token: string) {
  const roles = getRealmRoles(token);
  return roles.includes("host") || roles.includes("admin");
}

function errorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 400) return "Check the organization name (1–200 characters) and reason (up to 2,000 characters).";
    if (error.status === 403) return "Only eligible customer accounts can apply to become a host.";
  }
  return "Unable to access your host application. Please try again.";
}

export default function BecomeAHostPage() {
  const router = useRouter();
  const snackbar = useSnackbar();
  const [application, setApplication] = useState<HostApplication | null>(null);
  const [organizationName, setOrganizationName] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const [dashboardUser, setDashboardUser] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let active = true;
    const token = getStoredAccessToken();
    if (!token) {
      snackbar.warning("Please sign in to apply to become a host.");
      router.replace("/login");
      return;
    }
    if (isDashboardUser(token)) {
      setDashboardUser(true);
      setLoading(false);
      return;
    }

    async function loadApplication(accessToken: string) {
      try {
        const response = await api.hostApplications.me(accessToken);
        if (!active) return;
        setApplication(response.data);
        setOrganizationName(response.data.organizationName);
        setReason(response.data.reason ?? "");
      } catch (err) {
        if (!active) return;
        if (err instanceof ApiError && err.status === 404) {
          setApplication(null);
        } else if (err instanceof ApiError && err.status === 401) {
          clearStoredAuthSession();
          setError("Session expired. Please sign in again.");
          snackbar.warning("Session expired. Please sign in again.");
          router.replace("/login");
        } else {
          const message = errorMessage(err);
          setError(message);
          snackbar.error(message);
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    void loadApplication(token);
    return () => { active = false; };
  }, [router, snackbar, reload]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading || submittingRef.current || dashboardUser || error
      || (application && application.status !== "REJECTED")) return;
    const token = getStoredAccessToken();
    if (!token) {
      setError("Please sign in to apply to become a host.");
      snackbar.warning("Please sign in to apply to become a host.");
      router.replace("/login");
      return;
    }
    if (isDashboardUser(token)) {
      setDashboardUser(true);
      return;
    }
    if (!organizationName.trim() || organizationName.trim().length > 200 || reason.trim().length > 2000) {
      snackbar.warning("Enter an organization name of up to 200 characters and a reason of up to 2,000 characters.");
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);
    try {
      const response = await api.hostApplications.apply({ organizationName: organizationName.trim(), reason: reason.trim() }, token);
      setApplication(response.data);
      snackbar.success("Host application submitted for review.");
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        clearStoredAuthSession();
        setError("Session expired. Please sign in again.");
        snackbar.warning("Session expired. Please sign in again.");
        router.replace("/login");
      } else if (err instanceof ApiError && err.status === 409) {
        snackbar.warning("An application is already pending or approved. Checking your current status.");
        setLoading(true);
        setReload((value) => value + 1);
      } else if (err instanceof ApiError && err.status === 403) {
        setError(errorMessage(err));
        snackbar.error(errorMessage(err));
      } else {
        // Keep the form and entered values for validation/network retries; never display raw backend errors.
        snackbar.error(errorMessage(err));
      }
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }

  function retry() {
    setError(null);
    setLoading(true);
    setReload((value) => value + 1);
  }

  const canSubmit = !application || application.status === "REJECTED";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Card className="p-6 sm:p-8">
        <h1 className="text-3xl font-semibold text-white">Become a Host</h1>
        {loading ? <p className="mt-4 text-white/62" role="status">Loading your host application...</p> : dashboardUser ? (
          <>
            <p className="mt-4 text-white/62">Your account already has dashboard access. You do not need another host application.</p>
            <HostDashboardAction />
          </>
        ) : error ? (
          <div className="mt-6 space-y-4">
            <p role="alert" className="text-white/62">{error}</p>
            <Button type="button" variant="secondary" onClick={retry}>Try Again</Button>
            <ButtonLink href="/dashboard" variant="ghost">Back to Dashboard</ButtonLink>
          </div>
        ) : (
          <>
            {application?.status === "PENDING" && (
              <p className="mt-6 text-white/62" role="status">Host application is under review.</p>
            )}
            {application?.status === "APPROVED" && (
              <>
                <p className="mt-6 text-white/62" role="status">Your host application has been approved.</p>
                <HostDashboardAction />
              </>
            )}
            {application?.status === "REJECTED" && (
              <div className="mt-6 space-y-3 text-white/62" role="status">
                <p>Application was rejected.</p>
                {application.rejectionReason && <p className="whitespace-pre-wrap">{application.rejectionReason}</p>}
                <p>You can update your details and apply again.</p>
              </div>
            )}
            {canSubmit && (
              <form className="mt-6 space-y-5" onSubmit={(event) => void submit(event)}>
                <div className="space-y-2">
                  <label htmlFor="organizationName" className="text-sm text-white/65">Organization / Host Name</label>
                  <Input id="organizationName" name="organizationName" required maxLength={200}
                    value={organizationName} disabled={submitting} onChange={(event) => setOrganizationName(event.target.value)} />
                </div>
                <div className="space-y-2">
                  <label htmlFor="reason" className="text-sm text-white/65">Reason for becoming a host (optional)</label>
                  <textarea id="reason" name="reason" rows={5} maxLength={2000} value={reason} disabled={submitting}
                    onChange={(event) => setReason(event.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white outline-none focus:border-white/30" />
                </div>
                <Button type="submit" disabled={submitting || !organizationName.trim()}>
                  {submitting ? "Submitting..." : application?.status === "REJECTED" ? "Apply Again" : "Submit Application"}
                </Button>
              </form>
            )}
          </>
        )}
      </Card>
    </main>
  );
}
