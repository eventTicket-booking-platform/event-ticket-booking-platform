# API Integration Scaffold

These files were added only as a scaffold. They are not connected to the current pages yet.

## Files

- `lib/types.ts`
  Central shared domain types for events, bookings, and user profile.

- `lib/api/config.ts`
  Reads `NEXT_PUBLIC_API_BASE_URL` from environment variables.

- `lib/api/errors.ts`
  Custom `ApiError` class for consistent error handling.

- `lib/api/query.ts`
  Helper for serializing filter/query params.

- `lib/api/fetcher.ts`
  Low-level fetch wrapper that attaches headers, token, JSON serialization, and error parsing.

- `lib/api/endpoints.ts`
  Predefined endpoint functions for:
  - `auth.login`
  - `auth.register`
  - `auth.logout`
  - `auth.me`
  - `events.list`
  - `events.byId`
  - `bookings.create`
  - `bookings.mine`
  - `bookings.byId`
  - `bookings.cancel`

- `lib/api/index.ts`
  Re-export entry point.

## Expected backend route shape

This scaffold assumes routes like:

- `POST /auth/login`
- `POST /auth/register`
- `POST /auth/logout`
- `GET /auth/me`
- `GET /events`
- `GET /events/:id`
- `POST /bookings`
- `GET /bookings/me`
- `GET /bookings/:id`
- `PATCH /bookings/:id/cancel`

Adjust `lib/api/endpoints.ts` if your backend uses a different route structure.

## Usage example

Server component:

```ts
import { api } from "@/lib/api";

const events = await api.events.list({
  search: "music",
  category: "music",
});
```

Client component submit:

```ts
import { api } from "@/lib/api";

await api.auth.login({
  email,
  password,
});
```

## Next step

When you start wiring pages:

1. Replace reads from `lib/mock-data.ts` with calls to `api.events.*` and `api.bookings.*`.
2. Add token/cookie handling for authenticated endpoints.
3. Keep UI state and validation in the current pages, but move data access into the API layer above.
