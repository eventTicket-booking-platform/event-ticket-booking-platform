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
- Customer host applications with review status and rejected-application resubmission
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
- `/become-a-host`
- `/support`
- `/healthz`

## Backend Integration

This frontend now calls live backend APIs through the gateway.

Main integrations:

- auth: login, register, verify email, resend OTP, request password reset, verify password reset, reset password, profile, avatar upload
- events: list, categories, event detail
- bookings: create booking, current user bookings, booking detail
- host applications: authenticated submission and current user's application status

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

Run `npm test` for the focused Node tests and `npm run build` for the production
build. Booking tests cover key reuse/change, network and token-refresh retries,
booking headers and sold-out quantity controls. Host application tests mount the
page in jsdom and exercise status rendering, submission/resubmission, customer
navigation, authentication, safe errors and token-refresh retries using the real
API helper with controlled HTTP responses.
See [API_INTEGRATION.md](API_INTEGRATION.md) for live verification steps and limits.

## Become a Host

Authenticated USER/CUSTOMER accounts can open `/become-a-host` from the existing
navigation. The page reads `GET /user-service/api/v1/host-applications/me`; 404
shows the application form. Submission uses `POST /user-service/api/v1/host-applications`
with only `organizationName` (required, at most 200 characters) and `reason`
(optional, at most 2,000 characters). Existing token-refresh handling is reused.

PENDING shows review status without another form. APPROVED shows dashboard
guidance. REJECTED shows the rejection reason and allows editing and resubmission.
A 409 refreshes current status. HOST/ADMIN accounts receive dashboard guidance
instead of an application form; backend authorization remains authoritative.
Signed-out users follow the existing `/login` flow.

Set `NEXT_PUBLIC_HOST_DASHBOARD_URL` to the shared Angular dashboard's login URL
(for example, `http://localhost:4200/login` during local development). This public
setting is read at build time. The link does not transfer tokens between apps;
approved applicants sign in there to obtain updated HOST authority. If unset,
the page asks the user to obtain the dashboard URL from the administrator.

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
