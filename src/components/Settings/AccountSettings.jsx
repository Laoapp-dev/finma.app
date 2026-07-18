import { useLanguage } from "../../context/LanguageContext";
import { useCurrency } from "../../context/CurrencyContext";
import { Card } from "../common/Card";

export default function AccountSettings() {
  const { t, language, setLanguage, supportedLanguages } = useLanguage();
  const { currency, setCurrency, currencies } = useCurrency();

  return (
    <Card title={t("settings.title")}>
      <div className="space-y-6 max-w-md">
        <p className="text-ink/50 text-sm -mt-2">{t("app.fullName")}</p>

        <div>
          <label className="label">{t("settings.primaryCurrency")}</label>
          <select className="input" value={currency} onChange={(e) => setCurrency(e.target.value)}>
            {Object.values(currencies).map((c) => (
              <option key={c.code} value={c.code}>
                {c.symbol} {c.code}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">{t("settings.language")}</label>
          <select className="input" value={language} onChange={(e) => setLanguage(e.target.value)}>
            {supportedLanguages.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
        </div>

        {/* Both preferences above apply and save immediately (to this
            browser's local storage) — there's no separate "Save" step
            since there's no account to sync them to. */}
        <p className="text-ink/40 text-xs">{t("settings.appliedInstantly")}</p>
      </div>
    </Card>
  );
}
