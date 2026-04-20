import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiBaseUrl = String(env.VITE_API_URL || "").trim();
  const proxyTarget = String(env.VITE_PROXY_TARGET || "https://smart-financial-manager.onrender.com").trim();

  // During local dev, proxy /api requests through Vite to avoid browser CORS preflight issues.
  const enableApiProxy = apiBaseUrl.startsWith("/api") || apiBaseUrl.length === 0;

  return {
    plugins: [react()],
    server: enableApiProxy
      ? {
          proxy: {
            "/api": {
              target: proxyTarget,
              changeOrigin: true,
              secure: true,
              configure(proxy) {
                proxy.on("proxyReq", (proxyReq) => {
                  proxyReq.removeHeader("origin");
                });
              },
            },
          },
        }
      : undefined,
  };
});
