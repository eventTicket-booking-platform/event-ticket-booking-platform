export function getApiBaseUrl() {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:9090";

  return baseUrl.replace(/\/+$/, "");
}
