import type { BookingPayload } from "@/lib/api/types";

export type BookingSubmission = { fingerprint: string; key: string };

// Called once per logical submit, never by the low-level fetch/token refresh path.
export function resolveBookingSubmission(
  previous: BookingSubmission | null,
  payload: BookingPayload,
): BookingSubmission {
  const fingerprint = JSON.stringify(payload);
  return previous?.fingerprint === fingerprint
    ? previous
    : { fingerprint, key: crypto.randomUUID() };
}
