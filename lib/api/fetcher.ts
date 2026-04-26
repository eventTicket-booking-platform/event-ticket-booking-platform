import { getApiBaseUrl } from "@/lib/api/config";
import { ApiError } from "@/lib/api/errors";
import type { ApiErrorPayload } from "@/lib/api/types";
import { refreshAccessTokenWithStoredToken } from "@/lib/auth";

type ApiRequestOptions = Omit<RequestInit, "body"> & {
  body?: BodyInit | object;
  baseUrl?: string;
  token?: string;
};

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { baseUrl = getApiBaseUrl(), body, headers, token, ...rest } = options;

  const requestBody =
    body && !(body instanceof FormData) && typeof body !== "string"
      ? JSON.stringify(body)
      : body;

  const send = async (accessToken?: string) => {
    const resolvedHeaders = new Headers(headers);

    if (!resolvedHeaders.has("Content-Type") && body && !(body instanceof FormData)) {
      resolvedHeaders.set("Content-Type", "application/json");
    }

    if (accessToken) {
      resolvedHeaders.set("Authorization", `Bearer ${accessToken}`);
    }

    return fetch(`${baseUrl}${path}`, {
      ...rest,
      headers: resolvedHeaders,
      body: requestBody,
    });
  };

  let response = await send(token);

  if (response.status === 401 && token) {
    const refreshedToken = await refreshAccessTokenWithStoredToken();
    if (refreshedToken) {
      response = await send(refreshedToken);
    }
  }

  if (!response.ok) {
    throw await toApiError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

async function toApiError(response: Response): Promise<ApiError> {
  let payload: ApiErrorPayload | undefined;
  let resolvedMessage = "API request failed";

  try {
    const rawText = await response.text();

    if (rawText) {
      try {
        const parsed = JSON.parse(rawText) as ApiErrorPayload & {
          error?: string;
          error_description?: string;
          details?: { errors?: string[] };
        };

        payload = parsed;
        resolvedMessage =
          parsed?.message ||
          parsed?.error_description ||
          parsed?.error ||
          parsed?.details?.errors?.[0] ||
          resolvedMessage;
      } catch {
        resolvedMessage = rawText;
      }
    }
  } catch {
    payload = undefined;
  }

  if (resolvedMessage === "API request failed") {
    if (response.status === 401) {
      resolvedMessage = "Invalid email or password.";
    } else if (response.status >= 500) {
      resolvedMessage = "Server error. Please try again.";
    }
  }

  return new ApiError(resolvedMessage, response.status, payload);
}
