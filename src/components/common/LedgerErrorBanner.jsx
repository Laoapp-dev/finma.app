import { useLanguage } from "../../context/LanguageContext";

/**
 * A save/delete can fail if the browser's local storage is full or
 * unavailable (e.g. some private-browsing modes block it entirely).
 * Previously nothing surfaced this — a failed write just looked like
 * nothing happened. This makes the failure visible with a plain-language
 * reason instead of a raw error dump.
 */
export default function LedgerErrorBanner({ error, onDismiss }) {
  const { t } = useLanguage();

  if (!error) return null;

  return (
    <div className="rounded-xl bg-lotus-50 border border-lotus/20 px-4 py-3 flex items-start gap-3 text-sm">
      <span className="text-lotus shrink-0" aria-hidden="true">
        ⚠️
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-lotus mb-0.5">{t("ledgerError.title")}</p>
        <p className="text-ink/70">{t("ledgerError.hint")}</p>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          aria-label="Dismiss"
          className="text-ink/40 hover:text-ink/70 shrink-0"
        >
          ✕
        </button>
      )}
    </div>
  );
}
