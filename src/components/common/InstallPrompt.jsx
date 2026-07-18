import { useEffect, useState } from "react";
import { useLanguage } from "../../context/LanguageContext";

const DISMISS_KEY = "finma.installPromptDismissed";

function isStandalone() {
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    // iOS Safari's own flag for "already added to home screen"
    window.navigator.standalone === true
  );
}

function isIOS() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

/**
 * Two different install paths, since browsers don't agree on one API:
 *  - Android Chrome/Edge fire `beforeinstallprompt`, which we capture and
 *    can trigger programmatically from our own button (`deferredPrompt`).
 *  - iOS Safari never fires that event at all — installing there is only
 *    possible via Share → "Add to Home Screen", a menu we can't open
 *    ourselves, so we just point at it with instructions instead.
 * Both are skipped entirely once the app is already running standalone
 * (i.e. already installed), and the dismissal is remembered so it doesn't
 * nag on every visit.
 */
export default function InstallPrompt() {
  const { t } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showIOSHint, setShowIOSHint] = useState(false);
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem(DISMISS_KEY) === "1"
  );

  useEffect(() => {
    if (isStandalone()) return;

    const onBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);

    if (isIOS()) setShowIOSHint(true);

    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  const dismiss = () => {
    setDismissed(true);
    localStorage.setItem(DISMISS_KEY, "1");
  };

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  if (dismissed || (!deferredPrompt && !showIOSHint)) return null;

  return (
    <div className="rounded-xl bg-indigo-50 border border-indigo-100 px-4 py-3 flex items-start gap-3 text-sm">
      <span className="text-indigo-600 shrink-0 text-lg" aria-hidden="true">
        📲
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-ink">{t("install.title")}</p>
        <p className="text-ink/60 text-xs mt-0.5">
          {deferredPrompt ? t("install.androidHint") : t("install.iosHint")}
        </p>
        {deferredPrompt && (
          <button onClick={handleInstall} className="btn-primary text-xs px-3 py-1.5 mt-2">
            {t("install.button")}
          </button>
        )}
      </div>
      <button onClick={dismiss} aria-label="Dismiss" className="text-ink/40 hover:text-ink/70 shrink-0">
        ✕
      </button>
    </div>
  );
}
