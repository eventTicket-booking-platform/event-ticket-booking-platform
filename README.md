# Event Ticket Booking Platform

Public-facing frontend for Event Hub. This Next.js application handles event discovery, account flows, booking checkout, and the user booking dashboard.

## Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4

## Features

- Homepage with live featured events and categories
- Event discovery with search, category, and city filters
- Event detail pages with venue and ticket tiers
- Multi-step booking checkout
- User registration
- Login
- Email verification and OTP resend
- Forgot-password flow with OTP verification and password reset
- Authenticated user dashboard
- Booking history and upcoming bookings
- Profile avatar upload
- Health route for runtime checks

## Route Map

- `/`
- `/events`
- `/categories`
- `/event/[id]`
- `/booking/[id]`
- `/login`
- `/register`
- `/verify-email`
- `/forgot-password`
- `/dashboard`
- `/support`
- `/healthz`

## Backend Integration

This frontend now calls live backend APIs through the gateway.

Main integrations:

- auth: login, register, verify email, resend OTP, request password reset, verify password reset, reset password, profile, avatar upload
- events: list, categories, event detail
- bookings: create booking, current user bookings, booking detail

Default browser base URL:

- `NEXT_PUBLIC_API_BASE_URL=/api`

Server-side data fetching also supports:

- `SERVER_API_BASE_URL`
- `GATEWAY_API_BASE_URL`

## Notes on Current Behavior

- Tokens are stored in `localStorage`.
- There is refresh-token support in `lib/auth.ts`.
- Checkout sends one UUID as both `Idempotency-Key` and `X-Correlation-ID`.
  It is retained for the mounted checkout's unchanged booking payload, including
  retries after network errors and token refresh. Submitting changed event/tier/
  quantity/payment data generates a new key. Reloading/leaving checkout loses
  that in-memory key.
- Ticket displays and selection limits use `availableQuantity`; zero is sold out.
  Atomic backend reservation remains authoritative if the displayed stock is stale.
- Booking cancellation is not exposed by the current backend.

## Verification

Run `npm test` for the focused Node contract tests (no additional test framework)
and `npm run build` for the production build. Tests cover key reuse/change,
network and token-refresh retries, booking headers and sold-out quantity controls.
See [API_INTEGRATION.md](API_INTEGRATION.md) for live verification steps and limits.

## Local Setup

1. Install dependencies:

```powershell
npm install
```

2. Create `.env.local` or use the provided example values:

```env
NEXT_PUBLIC_API_BASE_URL=/api
```

3. Ensure these backend services are running:
   - `gateway-service-api`
   - `auth-service-api`
   - `event-service-api`
   - `booking-service-api`

4. Start the app:

```powershell
npm run dev
```

Default port: `3000`

## Production

```powershell
npm run build
npm run start
```

## Container Health

The Kubernetes deployment uses:

- `GET /healthz`
