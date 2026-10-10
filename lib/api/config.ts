const LOCAL_GATEWAY_API_BASE_URL = "http://localhost:9090/api";
const KUBERNETES_GATEWAY_API_BASE_URL = "http://gateway-service:9090/api";

export function getApiBaseUrl() {
  const baseUrl =
    typeof window === "undefined"
      ? process.env.SERVER_API_BASE_URL || process.env.GATEWAY_API_BASE_URL || getDefaultServerApiBaseUrl()
      : process.env.NEXT_PUBLIC_API_BASE_URL || "/api";

  if (baseUrl === "." || baseUrl === "./") {
    return "";
  }

  return normalizeBaseUrl(baseUrl);
}

function normalizeBaseUrl(baseUrl: string) {
  return baseUrl.replace(/\/+$/, "");
}

function getDefaultServerApiBaseUrl() {
  return process.env.KUBERNETES_SERVICE_HOST ? KUBERNETES_GATEWAY_API_BASE_URL : LOCAL_GATEWAY_API_BASE_URL;
}
