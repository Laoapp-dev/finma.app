import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";

const TABS = [
  "dashboard",
  "fixedDeposit",
  "compoundInterest",
  "profitMargin",
  "npv",
  "opportunityCost",
  "settings",
];

export default function Navbar({ active, onNavigate }) {
  const { user, signOut } = useAuth();
  const { t } = useLanguage();

  return (
    <header className="bg-white border-b border-indigo-100 sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-display font-bold">
            ₭
          </div>
          <span className="font-display font-bold text-lg text-ink">{t("app.name")}</span>
        </div>

        <nav className="hidden md:flex items-center gap-1 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => onNavigate(tab)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                active === tab
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-ink/60 hover:text-ink hover:bg-indigo-50/60"
              }`}
            >
              {t(`nav.${tab}`)}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {user?.photoURL && (
            <img src={user.photoURL} alt="" className="h-8 w-8 rounded-full border border-indigo-100" />
          )}
          <button onClick={signOut} className="text-sm text-ink/60 hover:text-lotus transition-colors">
            {t("nav.signOut")}
          </button>
        </div>
      </div>

      {/* Mobile tab scroller */}
      <nav className="md:hidden flex gap-1 overflow-x-auto px-4 pb-2">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => onNavigate(tab)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              active === tab ? "bg-indigo-50 text-indigo-700" : "text-ink/60"
            }`}
          >
            {t(`nav.${tab}`)}
          </button>
        ))}
      </nav>
    </header>
  );
}
