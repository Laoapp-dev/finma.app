import { useLanguage } from "../../context/LanguageContext";

const NAV_ITEMS = [
  { key: "dashboard", icon: "📊" },
  { key: "financial", icon: "📒" },
  { key: "analytics", icon: "🧭" },
  { key: "fixedDeposit", icon: "🏦", section: "sidebarSections.calculators" },
  { key: "compoundInterest", icon: "📈" },
  { key: "profitMargin", icon: "📉" },
  { key: "npv", icon: "🧮" },
  { key: "opportunityCost", icon: "⚖️" },
  { key: "marginalCostRevenue", icon: "🏭" },
  { key: "loanRepayment", icon: "🏠" },
  { key: "stockRoiDividend", icon: "💹" },
  { key: "knowledge", icon: "📘", section: "sidebarSections.more" },
];

export default function Sidebar({ active, onNavigate, open, onClose }) {
  const { t } = useLanguage();

  const content = (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-4">
        <div className="h-9 min-w-[3rem] px-2 rounded-lg bg-indigo-600 flex items-center justify-center text-gold font-display font-bold shrink-0">
          Fin
        </div>
        <div className="min-w-0">
          <p className="font-display font-bold text-ink leading-tight truncate">{t("app.name")}</p>
          <p className="text-[11px] text-ink/40 leading-tight truncate">{t("app.tagline")}</p>
        </div>
      </div>

      <div className="stitch-divider" />

      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {NAV_ITEMS.map((item) => (
          <div key={item.key}>
            {item.section && (
              <p className="px-3 pt-3 pb-1 text-[10px] uppercase tracking-wider text-ink/35 font-semibold">
                {t(item.section)}
              </p>
            )}
            <button
              onClick={() => onNavigate(item.key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                active === item.key
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-ink/60 hover:bg-indigo-50/60 hover:text-ink"
              }`}
            >
              <span aria-hidden="true">{item.icon}</span>
              <span className="truncate flex-1 text-left">{t(`nav.${item.key}`)}</span>
            </button>
          </div>
        ))}

        <div className="stitch-divider my-2" />

        <button
          onClick={() => onNavigate("settings")}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            active === "settings"
              ? "bg-indigo-50 text-indigo-700"
              : "text-ink/60 hover:bg-indigo-50/60 hover:text-ink"
          }`}
        >
          <span aria-hidden="true">⚙️</span>
          <span>{t("nav.settings")}</span>
        </button>
      </nav>
    </div>
  );

  return (
    <>
      {/* Desktop: permanent rail */}
      <aside className="hidden md:block w-64 shrink-0 border-r border-indigo-100 bg-white h-screen sticky top-0">
        {content}
      </aside>

      {/* Mobile: slide-over */}
      {open && (
        <div className="md:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-ink/30" onClick={onClose} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-white shadow-xl">{content}</aside>
        </div>
      )}
    </>
  );
}
