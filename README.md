# Finma — Financial Personal Management

React (Vite) + Tailwind CSS frontend with a Firebase backend (Auth + Firestore),
supporting Lao / Thai / English localization, LAK / THB / USD currencies, and
installable as a PWA on Android, iOS, and desktop.

**Sign-in model:** every page and function is visible immediately — no login
wall on launch. Browsing, and the calculators' math, work for anyone. Only
*saving data* (the ledger, and your account profile) requires signing in
with Google, via the button in the top-right corner. If you're signed out,
those sections are shown dimmed with sample data and a "Sign in" prompt
overlaid, so you can see exactly what you'd get.

## 1. Setup

```bash
npm install
cp .env.example .env.local   # fill in your Firebase project keys
npm run dev
```

### Firebase project setup
1. Create a project at https://console.firebase.google.com
2. Enable **Authentication → Sign-in method → Google**.
3. Enable **Firestore Database** (start in production mode) and deploy the
   included `firestore.rules`.
4. Copy your web app config into `.env.local` (see `.env.example`).

## 2. Architecture

```
src/
  context/        Auth, Language, Currency — global React context providers
  hooks/          useLedger.js — Firestore-backed ledger + roll-over engine
  i18n/           en.json, lo.json, th.json, i18n.js — translations + t()
  utils/
    financeFormulas.js  Pure calculation engines (unit-testable, no React)
    currency.js         Currency metadata, formatting, conversion
    exportData.js       CSV / Excel export (xlsx, lazy-loaded)
    dateUtils.js        Month-key helpers for the roll-over engine
  components/
    Ledger/      Dashboard, TransactionForm, TransactionList
    Calculators/ FixedDeposit, CompoundInterest, NetProfitMargin, NPV,
                 OpportunityCost
    Settings/    AccountSettings
    common/      Sidebar, Topbar, AuthGate, ConfigError, ErrorBoundary, Card
```

### Design tokens ("Finma Ledger")
- Colors: Ink `#16233D`, Indigo `#2F4C7A`, Gold `#C9A227`, Paper `#F7F4EC`,
  Bamboo `#4E7D5D` (income), Lotus `#B85C55` (expense).
- Type: Sora (display/headings) + Inter (body) + Noto Sans Lao / Noto Sans
  Thai (script fallback).
- Signature motif: the "stitch divider" — a dashed rule referencing the
  woven borders of Lao silk textiles — used instead of plain `<hr>`s.

### Layout
- **Sidebar** (`components/common/Sidebar.jsx`) — persistent on desktop,
  a slide-over drawer on mobile. Lists every page plus a profile card
  (avatar, name, sign out) at the bottom.
- **Topbar** (`components/common/Topbar.jsx`) — mobile menu toggle, current
  page title, a language switcher (works signed out too), and the
  **Sign in with Google** button / account menu, top right.
- **AuthGate** (`components/common/AuthGate.jsx`) — wraps any section that
  needs an account. Renders its children dimmed and non-interactive with a
  "Sign in to save your data" overlay when signed out, and passes through
  normally once signed in. Used around the ledger's entry form/list and the
  Settings profile/save button — currency and language stay usable either way.

## 3. Firestore data model & how the ledger saves data

Once signed in, `useLedger.js` reads and writes Firestore directly (no
localStorage) via `onSnapshot` real-time listeners — edits sync instantly
across tabs/devices signed into the same account.

```
users/{uid}                          # profile doc: name, email, photoURL,
                                      # primaryCurrency, language
users/{uid}/ledgerEntries/{entryId}  # one doc per income/expense transaction
                                      # { date, type, category, description,
                                      #   amount, currency, cycleKey }
users/{uid}/monthlyCycles/{yyyy-mm}  # { openingBalance, closed, closingBalance }
```

**How it's wired (for reference if you extend it):**
- `src/firebase.js` initializes `auth` and `db` from your `.env.local` /
  build-time secrets, and exports `isFirebaseConfigured` so the app can show
  a clear error instead of crashing if a key is missing.
- `src/context/AuthContext.jsx` listens for sign-in state via
  `onAuthStateChanged`, and creates the `users/{uid}` profile doc on first
  sign-in via `setDoc`.
- `src/hooks/useLedger.js`:
  - Subscribes to `users/{uid}/ledgerEntries` with `onSnapshot` (ordered by
    date) — this is the "live sync" part.
  - `addTransaction` → `addDoc(...)`, `deleteTransaction` → `deleteDoc(...)`.
  - Runs the **monthly roll-over** on mount: reads
    `users/{uid}/monthlyCycles/{currentMonthKey}`; if it doesn't exist yet,
    it closes any still-open prior cycle(s) — `closingBalance = openingBalance
    + Σ(income) − Σ(expenses)`, converted to your primary currency — writes
    that with `closed: true`, then creates the new month's doc with
    `openingBalance` carried forward, and surfaces a one-time notice banner.
  - When signed **out**, the hook returns static sample transactions instead
    (read-only preview) — no Firestore calls happen at all until you sign in.
- `firestore.rules` (already included) restricts every read/write to
  `request.auth.uid == userId`, so users can only ever touch their own data.
  Deploy it with the [Firebase CLI](https://firebase.google.com/docs/firestore/security/get-started):
  ```bash
  npm install -g firebase-tools
  firebase login
  firebase deploy --only firestore:rules
  ```

**To add a new piece of saved data** (e.g. budgets, recurring bills): create
a new subcollection under `users/{uid}/...`, add a matching `match` block to
`firestore.rules`, and write a small hook mirroring `useLedger.js`'s
`onSnapshot` + `addDoc`/`deleteDoc` pattern.

## 4. Calculation engines (`src/utils/financeFormulas.js`)

| Function | Formula |
|---|---|
| `calculateFixedDeposit` | `I = P × (r/100) × (t/12)`; `Maturity = P + I` |
| `calculateCompoundInterest` | `FV = P(1+r/n)^(nt) + PMT × [((1+r/n)^(nt) − 1) / (r/n)]` |
| `calculateNetProfitMargin` | `Margin % = (NetProfit / GrossRevenue) × 100` |
| `calculateNPV` | `NPV = Σ CFₜ/(1+r)ᵗ − InitialInvestment` |
| `calculateOpportunityCost` | Compares compound future value of a chosen vs. foregone option; `OpportunityCost = FV(foregone) − FV(chosen)` |

All five are pure functions (no React, no side effects), and have been
verified against hand-calculated cases, including edge cases (zero revenue,
zero discount rate, identical options → zero opportunity cost). Run the
checks yourself:

```js
import { calculateFixedDeposit } from "./src/utils/financeFormulas";
calculateFixedDeposit({ principal: 1000, annualRatePct: 5, termMonths: 12 });
// => { interestEarned: 50, maturityValue: 1050 }
```

## 5. Multi-currency

`src/utils/currency.js` holds indicative LAK/THB/USD rates against USD.
Replace `FALLBACK_RATES_TO_USD` with a live FX API call (cached, e.g.
refreshed every few hours) via `setRates()` for production use.

## 6. Export

`src/utils/exportData.js` wraps the `xlsx` package to export any flat array
of objects to CSV or `.xlsx`. The library is **dynamically imported** only
when someone clicks an export button, keeping it out of the initial page
load entirely.

## 7. PWA & Android support

Finma ships as an installable Progressive Web App:
- `public/manifest.webmanifest` — app name, icons, theme color, standalone display mode
- `public/icons/` — 192px/512px icons plus a maskable variant for Android's adaptive icon shape
- `public/sw.js` — a runtime-caching service worker (network-first for navigation, stale-while-revalidate for assets), registered in `src/main.jsx`

On Android Chrome, visiting the deployed site shows an "Install app" / "Add
to Home screen" prompt automatically once the manifest + service worker are
served over HTTPS (GitHub Pages and Firebase Hosting both qualify). On iOS
Safari, use Share → "Add to Home Screen".

## 8. Performance: fixing "slow to show" / white screen

Three changes address this together:

1. **Instant loading shell.** `index.html` has a small inline `<style>` +
   `#shell` spinner that paints immediately, before any JS downloads —
   so there's never a truly blank screen, even on a slow connection.
2. **Code-splitting.** `App.jsx` lazy-loads every page (`React.lazy` +
   `Suspense`) and `exportData.js` dynamically imports `xlsx` — so the
   first paint only needs the Dashboard's code, not all six calculators
   plus the export library. `vite.config.js` also splits `vendor-react`,
   `vendor-firebase`, and `vendor-xlsx` into separate cacheable chunks.
3. **Non-blocking fonts.** Google Fonts are loaded via the
   `media="print" onload="this.media='all'"` trick, so the browser doesn't
   delay first paint waiting on them.

## 9. Troubleshooting: white screen after deploying

Two remaining causes to check if it still happens:

1. **Absolute asset paths under a subfolder.** GitHub Pages serves project
   sites from `https://<user>.github.io/<repo>/`, but an absolute base
   (`/assets/...`) 404s outside the domain root. Fixed via `base: "./"` in
   `vite.config.js` — works regardless of subfolder.
2. **A missing/misspelled Firebase secret.** If a `VITE_FIREBASE_*` value
   isn't set at build time, `initializeApp()` would throw before React
   renders. `src/firebase.js` guards against this and `App.jsx` shows a
   `ConfigError` screen listing exactly which key is missing. Any other
   runtime error is caught by `ErrorBoundary.jsx` and shown on-screen with
   its stack trace (also logged to the console).

## Next steps for production
- Add a scheduled Cloud Function to run the roll-over server-side at
  midnight on the 1st, so it doesn't depend on the app being opened that day.
- Add automated tests for `financeFormulas.js` (Vitest) and rules tests for
  `firestore.rules` (Firebase Emulator Suite).
- Consider Firestore's offline persistence (`enableIndexedDbPersistence`)
  if you want the ledger to keep working fully offline, not just cached
  page assets.
