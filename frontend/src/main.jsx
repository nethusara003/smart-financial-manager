import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { CurrencyProvider } from "./context/CurrencyContext";
import { ThemeProvider } from "./contexts/ThemeContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <CurrencyProvider>
        <App />
      </CurrencyProvider>
    </ThemeProvider>
  </React.StrictMode>
);
