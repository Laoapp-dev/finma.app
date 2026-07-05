# Finma — Financial Personal Management

React (Vite) + Tailwind CSS frontend with a Firebase backend (Auth + Firestore),
supporting Lao / English localization, LAK / THB / USD currencies, and installable
as a PWA on Android, iOS, and desktop.

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
  hooks/          useLedger.js — ledger state + monthly roll-over engine
  i18n/           en.json, lo.json, i18n.js — translation dictionaries + t()
  utils/
    financeFormulas.js  Pure calculation engines (unit-testable, no React)
    currency.js         Currency metadata, formatting, conversion
    exportData.js       CSV / Excel export (xlsx)
    dateUtils.js        Month-key helpers for the roll-over engine
  components/
    Auth/        Google sign-in screen
    Ledger/      Dashboard, TransactionForm, TransactionList
    Calculators/ FixedDeposit, CompoundInterest, NetProfitMargin, NPV,
                 OpportunityCost
    Settings/    AccountSettings
    common/      Navbar, Card/ResultTile
```

### Design tokens ("Finma Ledger")
- Colors: Ink `#16233D`, Indigo `#2F4C7A`, Gold `#C9A227`, Paper `#F7F4EC`,
  Bamboo `#4E7D5D` (income), Lotus `#B85C55` (expense).
- Type: Sora (display/headings) + Inter (body) + Noto Sans Lao (Lao script
  fallback for both).
- Signature motif: the "stitch divider" — a dashed rule referencing the
  woven borders of Lao silk textiles — used instead of plain `<hr>`s.

## 3. Monthly roll-over engine

`useLedger.js` stores transactions grouped by a `YYYY-MM` cycle key. On
mount it compares today's cycle key against the stored cycles:

1. Any open cycle in the past is **closed**: `closingBalance = openingBalance
   + Σ(income) − Σ(expenses)`, with every transaction converted to the
   user's primary currency before summing.
2. A new cycle is created for the current month with
   `openingBalance = previous closingBalance`.
3. A one-time rollover notice is surfaced in the Dashboard UI.

This logic is storage-agnostic — swap the `localStorage` calls for Firestore
writes to `users/{uid}/monthlyCycles/{yyyy-mm}` for multi-device sync.

## 4. Calculation engines (`src/utils/financeFormulas.js`)

| Function | Formula |
|---|---|
| `calculateFixedDeposit` | `I = P × (r/100) × (t/12)`; `Maturity = P + I` |
| `calculateCompoundInterest` | `FV = P(1+r/n)^(nt) + PMT × [((1+r/n)^(nt) − 1) / (r/n)]` |
| `calculateNetProfitMargin` | `Margin % = (NetProfit / GrossRevenue) × 100` |
| `calculateNPV` | `NPV = Σ CFₜ/(1+r)ᵗ − InitialInvestment` |
| `calculateOpportunityCost` | Compares compound future value of a chosen vs. foregone option; `OpportunityCost = FV(foregone) − FV(chosen)` |

All functions are pure (no React, no side effects) so they can be unit
tested directly, e.g. with Vitest:

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
of objects to CSV or `.xlsx` — used by the Ledger and by each calculator's
"Export CSV" button.

## 7. PWA & Android support

Finma ships as an installable Progressive Web App:
- `public/manifest.webmanifest` — app name, icons, theme color, standalone display mode
- `public/icons/` — 192px/512px icons plus a maskable variant for Android's adaptive icon shape
- `public/sw.js` — a runtime-caching service worker (network-first for navigation, stale-while-revalidate for assets), registered in `src/main.jsx`

On Android Chrome, visiting the deployed site shows an "Install app" / "Add to Home screen" prompt automatically once the manifest + service worker are served over HTTPS (GitHub Pages and Firebase Hosting both qualify). On iOS Safari, use Share → "Add to Home Screen" (Apple doesn't support the install prompt, but the `apple-touch-icon` and `apple-mobile-web-app-*` meta tags in `index.html` make it behave like a native app icon once added).

## 8. Troubleshooting: white screen after deploying

This is almost always one of two causes:

1. **Absolute asset paths under a subfolder.** GitHub Pages serves project
   sites from `https://<user>.github.io/<repo>/`, but Vite's default build
   emits absolute paths like `/assets/index.js`, which 404 outside the
   domain root. Fixed here via `base: "./"` in `vite.config.js` (relative
   paths work regardless of subfolder — no repo-name configuration needed).
2. **A missing/misspelled Firebase secret.** If a `VITE_FIREBASE_*` value
   isn't set at build time, `initializeApp()` throws before React can
   render anything. Fixed here two ways:
   - `src/firebase.js` checks all required keys are present and exports
     `isFirebaseConfigured` instead of throwing.
   - `App.jsx` shows a `ConfigError` screen listing exactly which keys are
     missing, instead of a blank page.
   - `src/components/common/ErrorBoundary.jsx` catches any other runtime
     error and displays it on-screen (with the stack trace in the console)
     rather than failing silently.

If you still see a blank screen, open the browser DevTools console (F12) —
the error boundary logs the full stack trace there.


- Wire `useLedger` to Firestore (`ledgerEntries` subcollection) instead of
  `localStorage` for cross-device sync; keep the same rollover logic.
- Add a scheduled Cloud Function to run the roll-over server-side at
  midnight on the 1st, so it doesn't depend on the app being open.
- Add automated tests for `financeFormulas.js` (Vitest) and rules tests for
  `firestore.rules` (Firebase Emulator Suite).
