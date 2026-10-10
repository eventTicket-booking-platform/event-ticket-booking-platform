import type { NextConfig } from "next";

const LOCAL_GATEWAY_API_BASE_URL = "http://localhost:9090/api";
const KUBERNETES_GATEWAY_API_BASE_URL = "http://gateway-service:9090/api";

function getRewriteApiBaseUrl() {
  const defaultBaseUrl = process.env.KUBERNETES_SERVICE_HOST
    ? KUBERNETES_GATEWAY_API_BASE_URL
    : LOCAL_GATEWAY_API_BASE_URL;

  return (process.env.SERVER_API_BASE_URL || process.env.GATEWAY_API_BASE_URL || defaultBaseUrl).replace(/\/+$/, "");
}

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${getRewriteApiBaseUrl()}/:path*`,
      },
    ];
  },
};

export default nextConfig;
