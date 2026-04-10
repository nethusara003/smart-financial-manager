import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import "./index.css";
import { CurrencyProvider } from "./context/CurrencyContext";
import { ChatProvider } from "./context/ChatContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { UserProvider } from "./context/UserContext";
import { ToastProvider } from "./components/ui/Toast";
import { queryClient } from "./lib/queryClient";

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
