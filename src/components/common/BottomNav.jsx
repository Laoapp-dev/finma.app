import { useLanguage } from "../../context/LanguageContext";

const CALCULATOR_KEYS = [
  "fixedDeposit",
  "compoundInterest",
  "profitMargin",
  "npv",
  "opportunityCost",
  "marginalCostRevenue",
  "loanRepayment",
  "stockRoiDividend",
];

const TABS = [
  { key: "dashboard", icon: "📊", isActive: (page) => page === "dashboard" },
  { key: "financial", icon: "📒", isActive: (page) => page === "financial" },
  { key: "analytics", icon: "🧭", isActive: (page) => page === "analytics" },
  {
    key: "calculators",
    icon: "🧮",
    // Tapping this tab jumps into the free trial calculator; it highlights
    // whenever any calculator page is active.
    isActive: (page) => CALCULATOR_KEYS.includes(page),
    navigateTo: "fixedDeposit",
  },
];

export default function BottomNav({ active, onNavigate }) {
  const { t } = useLanguage();

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-indigo-100 flex pb-[env(safe-area-inset-bottom)]">
      {TABS.map((tab) => {
        const isActive = tab.isActive(active);
        return (
          <button
            key={tab.key}
            onClick={() => onNavigate(tab.navigateTo || tab.key)}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-xs font-medium transition-colors ${
              isActive ? "text-indigo-700" : "text-ink/50"
            }`}
          >
            <span aria-hidden="true" className="text-lg leading-none">
              {tab.icon}
            </span>
            <span className="truncate max-w-[4.5rem]">
              {tab.key === "calculators" ? t("sidebarSections.calculators") : t(`nav.${tab.key}`)}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
