# Customer API integration

Pages use `lib/api/endpoints.ts` through `lib/api/fetcher.ts`. Browser calls use
`NEXT_PUBLIC_API_BASE_URL` (default `/api`); server calls use
`SERVER_API_BASE_URL` / `GATEWAY_API_BASE_URL` with the configured gateway fallback.

## Booking contract

- Public event: `GET /event-service/api/v1/events/{eventId}`.
  Each tier includes `ticketTypeId`, `totalQuantity` and `availableQuantity`.
- Create: `POST /booking-service/api/v1/bookings`, bearer JWT,
  `Idempotency-Key` and `X-Correlation-ID`.
- Body: `{ eventId, ticketSelections: [{ ticketTypeId, quantity }], paymentMethod: "CARD" }`.
- Completed same-user/key/body replays return 201 and the same booking.
  Changed bodies or in-progress claims return 409.
- Customer history/detail: `GET /booking-service/api/v1/bookings/my` and
  `GET /booking-service/api/v1/bookings/{bookingId}`.
- No booking cancellation endpoint/helper is exposed.

Checkout generates a UUID at logical submission and retains it in a ref while
the request payload is unchanged. Failed requests keep that key; token refresh
retries retain the supplied headers and body. Submitting changed event, ticket
selection, quantity or payment method replaces it. Double clicks are blocked
while a submission is in flight. The key is not displayed. It is not persisted
across page reload/navigation; after an uncertain result, check booking history
before starting another checkout.

## Local checks

`npm test` exercises actual TypeScript helper/fetcher/API modules with controlled
HTTP/auth dependencies, plus rendered ticket quantity controls.
`npm run build` checks the production application.
Event Service's `TicketInventoryLifecycleTest` uses real H2 persistence/service
transactions for inventory mapping and edit invariants; Booking Service checks
the added response field's JSON compatibility and existing idempotency behavior.

These checks do not replace a deployed browser/backend smoke test.

## Live verification when services are running

Use a dedicated future published event, an existing verified CUSTOMER login and
the shared HOST/ADMIN dashboard. Do not capture credentials or JWTs in evidence.

1. Open the event and record tier IDs, total and available quantities.
2. Choose quantity within availability; verify zero-availability tiers are sold
   out and disabled.
3. Submit checkout. In browser Network, verify both headers exist and match;
   record booking ID and the request body.
4. Refresh the event page; verify availability fell by the booked quantities.
5. Repeat the exact request with the same authenticated user/key/body; expect
   the same booking ID and no additional inventory deduction.
6. Change the body under that key; expect 409.
7. For a tier with total 100 / available 40, edit total to 120 while preserving
   its ID; expect available 60. Total 50 or omission must conflict. Removing an
   unsold tier should succeed while other tier IDs remain unchanged.

The request field for existing tiers is `id`, populated from response
`ticketTypeId`; null/missing means a new tier. Outstanding reservations count
as committed inventory during edits. Backend atomic reservation is authoritative
when another customer purchases after the UI's inventory read.

**Live verification pending:** the local gateway/Auth/Event/Booking ports were
unreachable during this change. No browser booking, live duplicate submission
or deployed inventory result is claimed.
