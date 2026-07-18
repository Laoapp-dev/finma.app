import { useLanguage } from "../../context/LanguageContext";

export default function Topbar({ onMenuClick, pageTitle }) {
  const { t, language, setLanguage, supportedLanguages } = useLanguage();

  return (
    <header className="bg-white border-b border-indigo-100 sticky top-0 z-10">
      <div className="px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onMenuClick}
            className="md:hidden h-9 w-9 flex items-center justify-center rounded-lg text-ink/60 hover:bg-indigo-50"
            aria-label="Open menu"
          >
            ☰
          </button>
          <h1 className="font-display font-semibold text-ink truncate">{pageTitle}</h1>
        </div>

        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="text-sm border border-indigo-100 rounded-lg px-2 py-1.5 text-ink/70 bg-white shrink-0"
          aria-label={t("settings.language")}
        >
          {supportedLanguages.map((l) => (
            <option key={l.code} value={l.code}>
              {l.label}
            </option>
          ))}
        </select>
      </div>
    </header>
  );
}
