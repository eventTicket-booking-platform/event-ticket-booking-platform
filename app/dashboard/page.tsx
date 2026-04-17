"use client";

import { type ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BookingCard } from "@/components/booking-card";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSnackbar } from "@/components/ui/snackbar";
import { api, ApiError } from "@/lib/api";
import type { BookingResponse, UserProfileResponse } from "@/lib/api/types";
import { clearStoredAccessToken, getStoredAccessToken } from "@/lib/auth";
import { formatCurrency, formatDate } from "@/lib/utils";

const tabs = ["upcoming", "history"] as const;

export default function DashboardPage() {
  const router = useRouter();
  const [tab, setTab] = useState<(typeof tabs)[number]>("upcoming");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const snackbar = useSnackbar();

  useEffect(() => {
    const token = getStoredAccessToken();

    if (!token) {
      snackbar.warning("Please sign in to access your dashboard.");
      router.replace("/login");
      return;
    }
    const accessToken = token;

    async function loadDashboard() {
      try {
        const [profileResponse, bookingsResponse] = await Promise.all([api.auth.me(accessToken), api.bookings.mine(accessToken)]);
        setProfile(profileResponse.data);
        setBookings(bookingsResponse.dataList);
        setError(null);
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          clearStoredAccessToken();
          snackbar.warning("Session expired. Please sign in again.");
          router.replace("/login");
          return;
        }
        const message = err instanceof Error ? err.message : "Failed to load dashboard";
        setError(message);
        snackbar.error(message);
      } finally {
        setLoading(false);
      }
    }

    void loadDashboard();
  }, [router, snackbar]);

  const filteredBookings = useMemo(() => {
    const now = Date.now();

    return bookings.filter((booking) => {
      const eventTime = booking.eventStartDateTime ? new Date(booking.eventStartDateTime).getTime() : Number.NaN;
      const hasEventTime = !Number.isNaN(eventTime);
      const isFuture = !Number.isNaN(eventTime) && eventTime >= now;
      const status = booking.status as string;
      const isActiveStatus = status === "CONFIRMED" || status === "PENDING_PAYMENT" || status === "PENDING";
      const isUpcoming = isActiveStatus && (!hasEventTime || isFuture);

      if (tab === "upcoming") {
        return isUpcoming;
      }

      return !isUpcoming;
    });
  }, [bookings, tab]);

  const initials = `${profile?.firstName?.[0] ?? ""}${profile?.lastName?.[0] ?? ""}`.toUpperCase() || "EH";
  const totalSpent = bookings.reduce((sum, booking) => sum + booking.totalAmount, 0);

  async function handleAvatarFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      snackbar.warning("Please choose an image file.");
      event.target.value = "";
      return;
    }

    const token = getStoredAccessToken();
    if (!token) {
      snackbar.warning("Session expired. Please sign in again.");
      router.replace("/login");
      return;
    }

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      setUploadingAvatar(true);
      await api.auth.uploadAvatar(formData, token);
      const profileResponse = await api.auth.me(token);
      setProfile(profileResponse.data);
      snackbar.success("Avatar updated successfully.");
    } catch (err) {
      snackbar.error(err instanceof ApiError ? err.message : "Unable to upload avatar.");
    } finally {
      setUploadingAvatar(false);
      event.target.value = "";
    }
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <Card className="p-8 text-white">Loading your dashboard...</Card>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <Card className="p-8">
          <h1 className="text-2xl font-semibold text-white">Unable to load your dashboard</h1>
          <p className="mt-3 text-sm text-white/62">{error}</p>
          <div className="mt-6">
            <ButtonLink href="/events">Browse Events</ButtonLink>
          </div>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-12 sm:px-6 lg:flex-row lg:px-8">
      <aside className="lg:w-[320px]">
        <Card className="p-6">
          {profile?.resourceUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.resourceUrl}
              alt={`${[profile?.firstName, profile?.lastName].filter(Boolean).join(" ") || "EventHub User"} avatar`}
              className="size-18 rounded-full border border-white/10 object-cover"
            />
          ) : (
            <div className="flex size-18 items-center justify-center rounded-full bg-white text-2xl font-semibold text-black">
              {initials}
            </div>
          )}
          <h1 className="mt-5 text-2xl font-semibold text-white">
            {[profile?.firstName, profile?.lastName].filter(Boolean).join(" ") || "EventHub User"}
          </h1>
          <p className="mt-2 text-sm text-white/58">{profile?.email}</p>
          <div className="mt-4">
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => void handleAvatarFileChange(event)}
            />
            <button
              type="button"
              className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/80 transition hover:bg-white/10 disabled:opacity-50"
              disabled={uploadingAvatar}
              onClick={() => avatarInputRef.current?.click()}
            >
              {uploadingAvatar ? "Uploading..." : "Change Avatar"}
            </button>
          </div>
          <div className="mt-6 grid gap-4 text-sm text-white/62">
            <p>Access: authenticated booking dashboard</p>
            <p>{bookings.length} total bookings</p>
            <p>{formatCurrency(totalSpent)} total spent</p>
            {bookings[0]?.bookingDate ? <p>Latest booking {formatDate(bookings[0].bookingDate)}</p> : null}
          </div>
        </Card>
      </aside>
      <section className="flex-1 space-y-6">
        <Card className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/45">Dashboard</p>
              <h2 className="mt-2 text-3xl font-semibold text-white">Manage your bookings.</h2>
            </div>
            <div className="inline-flex rounded-full border border-white/10 bg-white/5 p-1">
              {tabs.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setTab(item)}
                  className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                    tab === item ? "bg-white text-black" : "text-white/65"
                  }`}
                >
                  {item === "upcoming" ? "Upcoming" : "History"}
                </button>
              ))}
            </div>
          </div>
        </Card>
        {filteredBookings.length ? (
          <div className="space-y-6">
            {filteredBookings.map((booking) => (
              <BookingCard key={booking.bookingId} booking={booking} />
            ))}
          </div>
        ) : (
          <Card className="p-10 text-center">
            <h3 className="text-2xl font-semibold text-white">
              {tab === "upcoming" ? "No upcoming bookings" : "No booking history yet"}
            </h3>
            <p className="mt-4 text-sm leading-7 text-white/62">
              {tab === "upcoming"
                ? "Browse public events and complete a booking to see it here."
                : "Completed, expired, or cancelled bookings will appear in this section."}
            </p>
          </Card>
        )}
      </section>
    </main>
  );
}
