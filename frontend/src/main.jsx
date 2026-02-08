import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { CurrencyProvider } from "./context/CurrencyContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { UserProvider } from "./context/UserContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <CurrencyProvider>
        <UserProvider>
          <App />
        </UserProvider>
      </CurrencyProvider>
    </ThemeProvider>
  </React.StrictMode>
);
