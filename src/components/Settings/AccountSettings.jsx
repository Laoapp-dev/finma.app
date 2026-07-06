import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { useCurrency } from "../../context/CurrencyContext";
import { Card } from "../common/Card";
import AuthGate from "../common/AuthGate";

export default function AccountSettings() {
  const { user, profile, updateProfile } = useAuth();
  const { t, language, setLanguage, supportedLanguages } = useLanguage();
  const { currency, setCurrency, currencies } = useCurrency();
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    await updateProfile({ primaryCurrency: currency, language });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <Card title={t("settings.title")}>
      {/* A single AuthGate wraps the whole page — Settings is a "locked"
          function like the other non-trial ones. (Guests who just want to
          preview the UI in their language can still use the quick language
          switcher in the Topbar without needing this page.) */}
      <AuthGate>
        <div className="space-y-6 max-w-md">
          <p className="text-ink/50 text-sm -mt-2">{t("app.fullName")}</p>

          <div>
            <h3 className="font-display font-semibold text-ink mb-3">{t("settings.profile")}</h3>
            <div className="flex items-center gap-3 mb-4">
              {(profile?.photoURL || user?.photoURL) && (
                <img src={profile?.photoURL || user?.photoURL} alt="" className="h-12 w-12 rounded-full" />
              )}
              <div>
                <p className="font-medium text-ink">{profile?.name || user?.displayName}</p>
                <p className="text-sm text-ink/50">{profile?.email || user?.email}</p>
              </div>
            </div>
          </div>

          <div className="stitch-divider" />

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

          <button className="btn-primary" onClick={handleSave}>
            {t("settings.save")}
          </button>
          {saved && <p className="text-bamboo text-sm mt-2">{t("settings.saved")}</p>}
        </div>
      </AuthGate>
    </Card>
  );
}
