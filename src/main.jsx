import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { AuthProvider } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";
import { CurrencyProvider } from "./context/CurrencyContext";
import ErrorBoundary from "./components/common/ErrorBoundary";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <LanguageProvider>
        <CurrencyProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </CurrencyProvider>
      </LanguageProvider>
    </ErrorBoundary>
  </React.StrictMode>
);

// Tell index.html's watchdog that React actually mounted, so it doesn't
// replace the shell with a "taking too long" diagnostic message.
window.__FINMA_MOUNTED__ = true;
if (window.__FINMA_MOUNT_TIMER__) clearTimeout(window.__FINMA_MOUNT_TIMER__);

// PWA: register the service worker for offline support + installability.
// Uses a relative path so it works whether Finma is hosted at a domain
// root or under a GitHub Pages /<repo>/ subfolder.
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./sw.js")
      .catch((err) => console.warn("Service worker registration failed:", err));
  });
}
