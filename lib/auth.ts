import { getApiBaseUrl } from "@/lib/api/config";

export const ACCESS_TOKEN_KEY = "eventhub_access_token";
export const REFRESH_TOKEN_KEY = "eventhub_refresh_token";

type KeycloakTokenPayload = {
  access_token: string;
  refresh_token?: string;
};

type StandardResponse<T> = {
  code: number;
  message: string;
  data: T;
};

let refreshPromise: Promise<string | null> | null = null;

export function getStoredAccessToken() {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getStoredRefreshToken() {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setStoredAccessToken(token: string) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function setStoredAuthSession(accessToken: string, refreshToken?: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);

  if (refreshToken) {
    window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
}

export function clearStoredAccessToken() {
  clearStoredAuthSession();
}

export function clearStoredAuthSession() {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export async function refreshAccessTokenWithStoredToken(): Promise<string | null> {
  if (typeof window === "undefined") {
    return null;
  }

  const refreshToken = getStoredRefreshToken();
  if (!refreshToken) {
    return null;
  }

  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const response = await fetch(`${getApiBaseUrl()}/user-service/api/v1/users/visitors/refresh-token`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refreshToken }),
        });

        if (!response.ok) {
          throw new Error("Refresh token request failed.");
        }

        const payload = (await response.json()) as StandardResponse<KeycloakTokenPayload>;
        const nextAccessToken = payload?.data?.access_token?.trim();
        if (!nextAccessToken) {
          throw new Error("Refresh token request returned no access token.");
        }

        setStoredAuthSession(nextAccessToken, payload?.data?.refresh_token ?? refreshToken);
        return nextAccessToken;
      } catch {
        clearStoredAuthSession();
        return null;
      } finally {
        refreshPromise = null;
      }
    })();
  }

  return refreshPromise;
}
