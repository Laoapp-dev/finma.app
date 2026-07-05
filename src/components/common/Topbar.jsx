import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";

export default function Topbar({ onMenuClick, pageTitle }) {
  const { user, profile, loading, signInWithGoogle, signOut } = useAuth();
  const { t, language, setLanguage, supportedLanguages } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const displayName = profile?.name || user?.displayName || user?.email || "";
  const photoURL = profile?.photoURL || user?.photoURL || "";

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

        {/* Language switcher — always available, even signed out, since it's
            just a local display preference and doesn't need an account. */}
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="hidden sm:block text-sm border border-indigo-100 rounded-lg px-2 py-1.5 text-ink/70 bg-white shrink-0"
          aria-label={t("settings.language")}
        >
          {supportedLanguages.map((l) => (
            <option key={l.code} value={l.code}>
              {l.label}
            </option>
          ))}
        </select>

        {/* Sign-in button (top right) — this is the one required gate for
            saving/editing data; browsing every page never requires it. */}
        <div className="relative shrink-0" ref={menuRef}>
          {loading ? (
            <div className="h-9 w-24 rounded-xl bg-indigo-50 animate-pulse" />
          ) : user ? (
            <>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-indigo-50 transition-colors"
              >
                <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center font-display font-bold text-indigo-700 overflow-hidden">
                  {photoURL ? (
                    <img src={photoURL} alt="" className="h-full w-full object-cover" />
                  ) : (
                    (displayName || "U")[0].toUpperCase()
                  )}
                </div>
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-indigo-100 rounded-xl shadow-lg py-1 z-20">
                  <div className="px-3 py-2 border-b border-indigo-50">
                    <p className="text-sm font-medium text-ink truncate">{displayName}</p>
                    <p className="text-xs text-ink/50 truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={signOut}
                    className="w-full text-left px-3 py-2 text-sm text-ink/70 hover:bg-lotus-50 hover:text-lotus transition-colors"
                  >
                    {t("nav.signOut")}
                  </button>
                </div>
              )}
            </>
          ) : (
            <button onClick={signInWithGoogle} className="btn-primary text-sm px-4 py-2 flex items-center gap-2">
              <GoogleIcon />
              {t("nav.signIn")}
            </button>
          )}
        </div>
      </div>
    </header>
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
