import { useLanguage } from "../../context/LanguageContext";

export default function MaintenanceScreen() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen flex items-center justify-center bg-paper px-4">
      <div className="card max-w-md w-full text-center">
        <div className="h-11 w-14 mx-auto rounded-lg bg-indigo-600 flex items-center justify-center text-gold font-display font-bold mb-4">
          Fin
        </div>
        <h1 className="font-display font-bold text-xl text-ink mb-2">{t("maintenance.title")}</h1>
        <p className="text-ink/60 text-sm">{t("maintenance.body")}</p>
      </div>
    </div>
  );
}
