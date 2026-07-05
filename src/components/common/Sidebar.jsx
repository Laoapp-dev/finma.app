import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";

const NAV_ITEMS = [
  { key: "dashboard", icon: "📒" },
  { key: "fixedDeposit", icon: "🏦" },
  { key: "compoundInterest", icon: "📈" },
  { key: "profitMargin", icon: "📊" },
  { key: "npv", icon: "🧮" },
  { key: "opportunityCost", icon: "⚖️" },
];

export default function Sidebar({ active, onNavigate, open, onClose }) {
  const { t } = useLanguage();
  const { user, profile, loading, signInWithGoogle, signOut } = useAuth();
  const displayName = profile?.name || user?.displayName || user?.email || "";
  const photoURL = profile?.photoURL || user?.photoURL || "";

  const content = (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-4">
        <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-display font-bold shrink-0">
          F
        </div>
        <div className="min-w-0">
          <p className="font-display font-bold text-ink leading-tight truncate">{t("app.name")}</p>
          <p className="text-[11px] text-ink/40 leading-tight truncate">{t("app.tagline")}</p>
        </div>
      </div>

      <div className="stitch-divider" />

      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.key}
            onClick={() => onNavigate(item.key)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              active === item.key
                ? "bg-indigo-50 text-indigo-700"
                : "text-ink/60 hover:bg-indigo-50/60 hover:text-ink"
            }`}
          >
            <span aria-hidden="true">{item.icon}</span>
            <span className="truncate">{t(`nav.${item.key}`)}</span>
          </button>
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

      <div className="stitch-divider" />

      {/* Profile summary / sign-in-out — always visible so account status
          is never a mystery, per the "functions visible, actions gated"
          pattern used across the app. */}
      <div className="p-3">
        {loading ? (
          <div className="flex items-center gap-2 px-2 py-2">
            <div className="h-8 w-8 rounded-full bg-indigo-50 animate-pulse" />
            <div className="h-3 w-20 rounded bg-indigo-50 animate-pulse" />
          </div>
        ) : user ? (
          <div className="flex items-center gap-2 px-2 py-2">
            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center font-display font-bold text-indigo-700 shrink-0 overflow-hidden">
              {photoURL ? (
                <img src={photoURL} alt="" className="h-full w-full object-cover" />
              ) : (
                (displayName || "U")[0].toUpperCase()
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-ink truncate">{displayName}</p>
              <button onClick={signOut} className="text-xs text-ink/40 hover:text-lotus transition-colors">
                {t("nav.signOut")}
              </button>
            </div>
          </div>
        ) : (
          <button onClick={signInWithGoogle} className="btn-primary w-full text-sm px-3 py-2">
            {t("nav.signIn")}
          </button>
        )}
      </div>
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
