export function getApiBaseUrl() {
  const baseUrl =
    typeof window === "undefined"
      ? process.env.SERVER_API_BASE_URL || "http://gateway-service:9090/api"
      : process.env.NEXT_PUBLIC_API_BASE_URL || "/api";

  return baseUrl.replace(/\/+$/, "");
}

export function getEventApiBaseUrl() {
  const baseUrl =
    typeof window === "undefined"
      ? process.env.SERVER_EVENTS_API_BASE_URL || "http://event-service:9091"
      : process.env.NEXT_PUBLIC_API_BASE_URL || "/api";

  return baseUrl.replace(/\/+$/, "");
}
