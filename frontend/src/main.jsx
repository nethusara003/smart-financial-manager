import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import App from "./App.jsx";
import "./index.css";
import { CurrencyProvider } from "./context/CurrencyContext";
import { ChatProvider } from "./context/ChatContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { UserProvider } from "./context/UserContext";
import { ToastProvider } from "./components/ui/Toast";
import { queryClient } from "./lib/queryClient";

const DEFAULT_CANONICAL_APP_URL = "https://smart-financial-tracker.vercel.app";

function getCanonicalAppUrl() {
  return (import.meta.env.VITE_APP_URL || DEFAULT_CANONICAL_APP_URL).replace(/\/+$/, "");
}

function shouldRedirectToCanonicalHost(canonicalAppUrl) {
  if (!import.meta.env.PROD || typeof window === "undefined") {
    return false;
  }

  if (window.location.origin === canonicalAppUrl) {
    return false;
  }

  const hostname = window.location.hostname;
  const isProjectVercelAlias =
    hostname.startsWith("smart-financial-tracker-") && hostname.endsWith(".vercel.app");

  return isProjectVercelAlias;
}

const canonicalAppUrl = getCanonicalAppUrl();

if (shouldRedirectToCanonicalHost(canonicalAppUrl)) {
  const nextUrl =
    `${canonicalAppUrl}${window.location.pathname}` +
    `${window.location.search}${window.location.hash}`;

  window.location.replace(nextUrl);
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ToastProvider position="top-right" maxToasts={5}>
          <CurrencyProvider>
            <UserProvider>
              <ChatProvider>
                <App />
              </ChatProvider>
            </UserProvider>
          </CurrencyProvider>
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
