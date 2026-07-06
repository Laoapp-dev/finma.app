import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";

/**
 * Wraps a page's content so it's always visible (per the "show the
 * functions, gate the actions" pattern) but non-interactive and dimmed
 * until the person signs in. Used by Dashboard (ledger data needs an
 * account to save to Firestore), AccountSettings (nothing to configure
 * without a profile), and the non-trial calculators (Net Profit Margin,
 * NPV, Opportunity Cost — Fixed Deposit and Compound Interest stay free).
 */
export default function AuthGate({ children, variant = "data" }) {
  const { user, loading, signInWithGoogle } = useAuth();
  const { t } = useLanguage();

  if (loading || user) return children;

  const titleKey = variant === "feature" ? "auth.lockedTitleFeature" : "auth.lockedTitle";
  const subtitleKey = variant === "feature" ? "auth.lockedSubtitleFeature" : "auth.lockedSubtitle";

  return (
    <div className="relative">
      <div className="pointer-events-none select-none opacity-40">{children}</div>

      <div className="absolute inset-0 flex items-start justify-center pt-6 sm:items-center sm:pt-0">
        <div className="card max-w-sm w-full text-center mx-4 shadow-lg">
          <h2 className="font-display font-bold text-lg text-ink mb-1">{t(titleKey)}</h2>
          <p className="text-ink/60 text-sm mb-4">{t(subtitleKey)}</p>
          <button
            onClick={signInWithGoogle}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <GoogleIcon />
            {t("auth.signInWithGoogle")}
          </button>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#fff" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.87 2.7-6.62z" />
      <path fill="#fff" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.96v2.33A9 9 0 0 0 9 18z" />
      <path fill="#fff" d="M3.95 10.7A5.4 5.4 0 0 1 3.66 9c0-.59.1-1.16.29-1.7V4.97H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.03l2.99-2.33z" />
      <path fill="#fff" d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.97l2.99 2.33C4.66 5.17 6.65 3.58 9 3.58z" />
    </svg>
  );
}
