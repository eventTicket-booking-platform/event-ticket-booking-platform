import Link from "next/link";
import { BrandImage } from "@/components/brand-image";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { BookingResponse } from "@/lib/api/types";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";

const statusClassNames: Record<string, string> = {
  CONFIRMED: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
  PENDING_PAYMENT: "border-amber-400/20 bg-amber-400/10 text-amber-200",
  CANCELLED: "border-rose-400/20 bg-rose-400/10 text-rose-200",
  FAILED: "border-rose-400/20 bg-rose-400/10 text-rose-200",
  EXPIRED: "border-zinc-400/20 bg-zinc-400/10 text-zinc-200",
};

export function BookingCard({ booking }: { booking: BookingResponse }) {
  return (
    <Card className="overflow-hidden">
      <div className="grid gap-0 md:grid-cols-[280px_1fr]">
        <div className="p-3">
          {booking.eventBannerResourceUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={booking.eventBannerResourceUrl}
              alt={booking.eventTitle}
              className="h-full min-h-56 w-full rounded-[1.75rem] border border-white/10 object-cover"
            />
          ) : (
            <BrandImage category={booking.status} title={booking.eventTitle} className="h-full min-h-56" />
          )}
        </div>
        <div className="space-y-5 p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-xl font-semibold text-white">{booking.eventTitle}</h3>
              <p className="mt-2 text-sm text-white/62">
                {booking.eventStartDateTime ? formatDateTime(booking.eventStartDateTime) : "Event schedule available in booking details"}
              </p>
            </div>
            <Badge className={statusClassNames[booking.status] ?? "border-white/10 bg-white/10 text-white/80"}>{booking.status}</Badge>
          </div>
          <div className="grid gap-3 text-sm text-white/62 sm:grid-cols-2">
            <p>Booking Ref: {booking.bookingReference}</p>
            <p>Booked: {formatDate(booking.bookingDate)}</p>
            <p>Event ID: {booking.eventId}</p>
            <p>Total Paid: {formatCurrency(booking.totalAmount)}</p>
          </div>
          {booking.items?.length ? (
            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4 text-sm text-white/62">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/45">Ticket Overview</p>
              {booking.items.map((item) => (
                <p key={`${booking.bookingId}-${item.ticketTypeId}`}>
                  {item.quantity} x {item.ticketTypeName} ({formatCurrency(item.subtotal)})
                </p>
              ))}
            </div>
          ) : null}
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/event/${booking.eventId}`}
              className="rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400"
            >
              View Event
            </Link>
            <Link
              href={`/booking/${booking.eventId}`}
              className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Book Again
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
}
