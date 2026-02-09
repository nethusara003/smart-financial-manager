import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { CurrencyProvider } from "./context/CurrencyContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { UserProvider } from "./context/UserContext";
import { ToastProvider } from "./components/ui/Toast";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <ToastProvider position="top-right" maxToasts={5}>
        <CurrencyProvider>
          <UserProvider>
            <App />
          </UserProvider>
        </CurrencyProvider>
      </ToastProvider>
    </ThemeProvider>
  </React.StrictMode>
);
