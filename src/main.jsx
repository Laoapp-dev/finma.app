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
//
// `updateViaCache: "none"` is important: without it, the browser is
// allowed to serve a cached copy of sw.js itself (for up to 24h per spec)
// instead of checking the server, which is exactly how a device can stay
// stuck on an old/broken shell even after a fixed version is deployed —
// especially for an installed PWA, which doesn't get the same "just
// refresh the tab" escape hatch a normal browser tab has. Forcing this to
// "none" means every launch re-checks sw.js against the server.
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./sw.js", { updateViaCache: "none" })
      .then((registration) => {
        // Also proactively ask for an update check right away, rather
        // than waiting on the browser's own schedule.
        registration.update().catch(() => {});
      })
      .catch((err) => console.warn("Service worker registration failed:", err));
  });
}
