"use client";

import Link from "next/link";
import { use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { LockIcon } from "@/components/icons";
import { TicketTierCard } from "@/components/ticket-tier-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useSnackbar } from "@/components/ui/snackbar";
import { api, ApiError } from "@/lib/api";
import type { BookingResponse, EventDetailDto } from "@/lib/api/types";
import { getStoredAccessToken } from "@/lib/auth";
import { formatCurrency, formatDateTime, formatFullCurrency } from "@/lib/utils";

type Step = 1 | 2 | 3 | 4;

export default function BookingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const eventId = Number(id);
  const [event, setEvent] = useState<EventDetailDto | null>(null);
  const [step, setStep] = useState<Step>(1);
  const [processing, setProcessing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [booking, setBooking] = useState<BookingResponse | null>(null);
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [attendee, setAttendee] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [payment, setPayment] = useState({
    cardNumber: "",
    expiry: "",
    cvv: "",
  });
  const snackbar = useSnackbar();

  useEffect(() => {
    async function loadEvent() {
      if (Number.isNaN(eventId)) {
        setError("Invalid event id");
        setLoading(false);
        return;
      }

      try {
        const response = await api.events.byId(eventId);
        setEvent(response);
        setQuantities(Object.fromEntries(response.ticketTypes.map((tier) => [tier.ticketTypeId, 0])));
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load event");
      } finally {
        setLoading(false);
      }
    }

    void loadEvent();
  }, [eventId]);

  useEffect(() => {
    if (error) {
      snackbar.error(error);
    }
  }, [error, snackbar]);

  const selected = useMemo(
    () =>
      (event?.ticketTypes ?? [])
        .map((tier) => ({
          id: tier.ticketTypeId,
          name: tier.name,
          price: tier.price,
          available: tier.totalQuantity,
          quantity: quantities[tier.ticketTypeId] ?? 0,
        }))
        .filter((tier) => tier.quantity > 0),
    [event, quantities],
  );

  const subtotal = selected.reduce((sum, tier) => sum + tier.price * tier.quantity, 0);
  const serviceFee = subtotal * 0.1;
  const tax = subtotal * 0.08;
  const total = subtotal + serviceFee + tax;
  const ticketCount = selected.reduce((sum, tier) => sum + tier.quantity, 0);
  const canContinueDetails = ticketCount > 0;
  const attendeeValid = Object.values(attendee).every(Boolean) && attendee.email.includes("@");
  const paymentValid =
    payment.cardNumber.replace(/\s/g, "").length >= 16 && payment.expiry.length === 5 && payment.cvv.length >= 3;

  async function nextStep() {
    if (step === 1 && canContinueDetails) {
      setStep(2);
      return;
    }

    if (step === 2 && attendeeValid) {
      setStep(3);
      return;
    }

    if (step !== 3 || !paymentValid || !event) {
      return;
    }

    const token = getStoredAccessToken();
    if (!token) {
      snackbar.warning("Please sign in to continue with booking.");
      router.push("/login");
      return;
    }

    setProcessing(true);

    try {
      const response = await api.bookings.create(
        {
          eventId: event.eventId,
          ticketSelections: selected.map((tier) => ({
            ticketTypeId: tier.id,
            quantity: tier.quantity,
          })),
          paymentMethod: "CARD",
        },
        token,
      );

      setBooking(response);
      setStep(4);
      snackbar.success("Booking confirmed successfully.");
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        snackbar.warning("Session expired. Please sign in again.");
        router.push("/login");
        return;
      }
      snackbar.error(err instanceof Error ? err.message : "Failed to create booking");
    } finally {
      setProcessing(false);
    }
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <Card className="p-8 text-white">Loading checkout...</Card>
      </main>
    );
  }

  if (error || !event) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <Card className="p-8">
          <h1 className="text-2xl font-semibold text-white">Unable to load this event</h1>
          <p className="mt-3 text-sm text-white/62">{error ?? "This event is unavailable."}</p>
          <div className="mt-6">
            <Link href="/events" className="rounded-full bg-white px-5 py-3 text-sm font-semibold !text-black">
              Browse Events
            </Link>
          </div>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-12 sm:px-6 lg:px-8">
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/45">Checkout</p>
        <h1 className="text-4xl font-semibold tracking-tight text-white">{event.title}</h1>
        <p className="text-sm text-white/58">
          {formatDateTime(event.startDateTime)} · {event.venue.city}
        </p>
      </div>
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <section className="space-y-6">
          <Card className="p-4">
            <div className="grid gap-3 sm:grid-cols-4">
              {[
                { id: 1, label: "Ticket Selection" },
                { id: 2, label: "Attendee Details" },
                { id: 3, label: "Payment" },
                { id: 4, label: "Confirmation" },
              ].map((item) => (
                <div
                  key={item.id}
                  className={`rounded-2xl px-4 py-3 text-sm font-semibold ${
                    step >= item.id ? "bg-white text-black" : "bg-white/5 text-white/45"
                  }`}
                >
                  {item.id}. {item.label}
                </div>
              ))}
            </div>
          </Card>

          {step === 1 ? (
            <div className="space-y-4">
              {event.ticketTypes.map((tier) => (
                <TicketTierCard
                  key={tier.ticketTypeId}
                  tier={{
                    id: String(tier.ticketTypeId),
                    name: tier.name,
                    price: tier.price,
                    description: "Live ticket inventory from the event service.",
                    benefits: [`Available quantity: ${tier.totalQuantity}`],
                    available: tier.totalQuantity,
                  }}
                  quantity={quantities[tier.ticketTypeId] ?? 0}
                  onChange={(next) => setQuantities((current) => ({ ...current, [tier.ticketTypeId]: next }))}
                />
              ))}
            </div>
          ) : null}

          {step === 2 ? (
            <Card className="p-8">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  placeholder="First name"
                  value={attendee.firstName}
                  onChange={(event) => setAttendee((current) => ({ ...current, firstName: event.target.value }))}
                />
                <Input
                  placeholder="Last name"
                  value={attendee.lastName}
                  onChange={(event) => setAttendee((current) => ({ ...current, lastName: event.target.value }))}
                />
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Input
                  type="email"
                  placeholder="Email"
                  value={attendee.email}
                  onChange={(event) => setAttendee((current) => ({ ...current, email: event.target.value }))}
                />
                <Input
                  placeholder="Phone"
                  value={attendee.phone}
                  onChange={(event) => setAttendee((current) => ({ ...current, phone: event.target.value }))}
                />
              </div>
              {!attendeeValid ? <p className="mt-4 text-sm text-white/55">Complete all attendee details to continue.</p> : null}
            </Card>
          ) : null}

          {step === 3 ? (
            <Card className="p-8">
              <div className="mb-5 flex items-center gap-2 text-sm text-white/62">
                <LockIcon className="size-4" />
                <span>Secure payment simulation</span>
              </div>
              <div className="space-y-4">
                <Input
                  placeholder="Card number"
                  value={payment.cardNumber}
                  onChange={(event) =>
                    setPayment((current) => ({
                      ...current,
                      cardNumber: event.target.value
                        .replace(/\D/g, "")
                        .slice(0, 16)
                        .replace(/(\d{4})(?=\d)/g, "$1 "),
                    }))
                  }
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    placeholder="MM/YY"
                    value={payment.expiry}
                    onChange={(event) =>
                      setPayment((current) => ({
                        ...current,
                        expiry: event.target.value
                          .replace(/\D/g, "")
                          .slice(0, 4)
                          .replace(/(\d{2})(?=\d)/, "$1/"),
                      }))
                    }
                  />
                  <Input
                    placeholder="CVV"
                    value={payment.cvv}
                    onChange={(event) =>
                      setPayment((current) => ({
                        ...current,
                        cvv: event.target.value.replace(/\D/g, "").slice(0, 4),
                      }))
                    }
                  />
                </div>
              </div>
              {!paymentValid ? <p className="mt-4 text-sm text-white/55">Enter valid card details to process payment.</p> : null}
            </Card>
          ) : null}

          {step === 4 && booking ? (
            <Card className="p-8">
              <div className="flex size-16 items-center justify-center rounded-full bg-white text-black">OK</div>
              <h2 className="mt-6 text-3xl font-semibold text-white">Booking confirmed</h2>
              <p className="mt-3 text-sm leading-7 text-white/62">
                Your booking has been created successfully and is now available in your dashboard.
              </p>
              <div className="mt-6 rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
                <div className="grid gap-3 text-sm text-white/65">
                  <p>Booking reference: {booking.bookingReference}</p>
                  <p>Event: {booking.eventTitle}</p>
                  <p>Total amount: {formatFullCurrency(booking.totalAmount)}</p>
                  <p>Tickets: {selected.map((tier) => `${tier.quantity} x ${tier.name}`).join(", ")}</p>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/dashboard" className="rounded-full bg-white px-5 py-3 text-sm font-semibold !text-black">
                  View My Bookings
                </Link>
                <Link href="/events" className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white">
                  Browse More Events
                </Link>
              </div>
            </Card>
          ) : null}

          {step < 4 ? (
            <div className="flex items-center justify-between gap-4">
              {step === 1 ? (
                <Link href={`/event/${event.eventId}`} className="text-sm font-semibold text-white/70">
                  Back
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => setStep((current) => (current - 1) as Step)}
                  className="text-sm font-semibold text-white/70"
                >
                  Back
                </button>
              )}
              <Button
                onClick={() => void nextStep()}
                disabled={
                  processing ||
                  (step === 1 && !canContinueDetails) ||
                  (step === 2 && !attendeeValid) ||
                  (step === 3 && !paymentValid)
                }
              >
                {processing ? "Processing..." : step === 1 ? "Continue to Details" : step === 2 ? "Continue to Payment" : "Confirm Booking"}
              </Button>
            </div>
          ) : null}
        </section>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <Card className="p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/45">Order Summary</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">{event.title}</h2>
            <p className="mt-2 text-sm text-white/58">{formatDateTime(event.startDateTime)}</p>
            <div className="mt-6 space-y-4 border-t border-white/10 pt-6">
              {selected.length ? (
                selected.map((tier) => (
                  <div key={tier.id} className="flex items-start justify-between gap-4 text-sm text-white/65">
                    <div>
                      <p className="font-semibold text-white">{tier.name}</p>
                      <p>{tier.quantity} ticket(s)</p>
                    </div>
                    <span>{formatCurrency(tier.price * tier.quantity)}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-white/45">Select at least one ticket tier to begin checkout.</p>
              )}
            </div>
            <div className="mt-6 space-y-3 border-t border-white/10 pt-6 text-sm text-white/65">
              <div className="flex items-center justify-between">
                <span>Tickets</span>
                <span>{ticketCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span>{formatFullCurrency(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Service Fee</span>
                <span>{formatFullCurrency(serviceFee)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Tax</span>
                <span>{formatFullCurrency(tax)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-white/10 pt-3 text-base font-semibold text-white">
                <span>Total</span>
                <span>{formatFullCurrency(total)}</span>
              </div>
            </div>
          </Card>
        </aside>
      </div>
    </main>
  );
}
