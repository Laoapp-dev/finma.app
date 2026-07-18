# Finma — Financial Personal Management

React (Vite) + Tailwind CSS. Fully client-side — **no account, no backend,
no sign-in.** Supports Lao / Thai / English localization, LAK / THB / USD
currencies, and is installable as a PWA on Android, iOS, and desktop.

**Access model:** every page is open immediately — the ledger, every
calculator, and Knowledge. There is nothing to sign into and nothing
locked. Your ledger data (transactions, monthly opening balances) is saved
in this browser's `localStorage`, on this device only.

> **Data lives on-device only.** It isn't backed up automatically, doesn't
> sync between devices/browsers, and is lost if you clear your browser's
> site data. Use the CSV/Excel export on the Dashboard to keep a copy if
> that matters to you.

## 1. Setup

```bash
npm install
npm run dev
```

No environment variables, no third-party account, nothing to configure —
it just runs.

## 2. Architecture

```
src/
  context/        Language, Currency — global React context providers
                   (both persist their setting to localStorage instantly)
  hooks/          useLedger.js — the ledger, backed by localStorage
  i18n/           en.json, lo.json, th.json, i18n.js — translations + t()
  utils/
    financeFormulas.js  Pure calculation engines (unit-testable, no React)
    currency.js         Currency metadata, formatting, conversion
    exportData.js       CSV / Excel export (xlsx, lazy-loaded)
    dateUtils.js        Month-key helpers for the roll-over engine
  components/
    Ledger/      Dashboard (reports/charts/export), Financial (income/expense
                 entry — TransactionForm, TransactionList)
    Calculators/ FixedDeposit, CompoundInterest, NetProfitMargin, NPV,
                 OpportunityCost, MarginalCostRevenue, LoanRepayment,
                 StockROIDividend — all freely accessible
    Knowledge/   Knowledge — explainer for every calculator's formula
    Settings/    AccountSettings — currency + language preferences
    common/      Sidebar, Topbar, LedgerErrorBanner, ErrorBoundary, Card
```

### Design tokens ("Finma Ledger")
- Colors: Ink `#16233D`, Indigo `#2F4C7A`, Gold `#C9A227`, Paper `#F7F4EC`,
  Bamboo `#4E7D5D` (income), Lotus `#B85C55` (expense).
- Type: Sora (display/headings) + Inter (body) + Noto Sans Lao / Noto Sans
  Thai (script fallback).
- Signature motif: the "stitch divider" — a dashed rule referencing the
  woven borders of Lao silk textiles — used instead of plain `<hr>`s.

### Layout
- **Sidebar** (`components/common/Sidebar.jsx`) — persistent on desktop, a
  slide-over drawer on mobile. Every item navigates directly; nothing is
  gated or badged.
- **Topbar** (`components/common/Topbar.jsx`) — mobile menu toggle, current
  page title, and a language switcher.

## 3. How the ledger saves data (`src/hooks/useLedger.js`)

Two `localStorage` keys hold everything:

```
finma.ledgerEntries   JSON array of transactions:
                       { id, date, type, category, description, amount,
                         currency, cycleKey }
finma.monthlyCycles   JSON object keyed by "yyyy-mm":
                       { openingBalance, closed, closingBalance }
```

- `addTransaction` / `deleteTransaction` read the current array, splice in
  the change, and write it straight back with `localStorage.setItem` — no
  network round-trip, so the UI updates immediately.
- The **monthly roll-over** runs once per mount: if the current month's
  cycle doesn't exist yet, it closes any still-open prior cycle(s) —
  `closingBalance = openingBalance + Σ(income) − Σ(expenses)`, converted to
  your primary currency — and carries that forward as the new month's
  `openingBalance`, surfacing a one-time notice banner.
- A failed write (e.g. the browser's storage quota is full, or you're in a
  private-browsing mode that blocks storage entirely) is caught and shown
  via `LedgerErrorBanner` instead of failing silently — this used to be a
  real bug: transactions would appear to do nothing with no explanation.

**To add a new piece of saved data** (e.g. budgets, recurring bills): pick
a new `localStorage` key and write a small hook mirroring `useLedger.js`'s
read-modify-write pattern.

## 4. Calculation engines (`src/utils/financeFormulas.js`)

| Function | Formula |
|---|---|
| `calculateFixedDeposit` | `I = P × (r/100) × (t/12)`; `Maturity = P + I` |
| `calculateCompoundInterest` | `FV = P(1+r/n)^(nt) + PMT × [((1+r/n)^(nt) − 1) / (r/n)]` |
| `calculateNetProfitMargin` | `Margin % = (NetProfit / GrossRevenue) × 100` |
| `calculateNPV` | `NPV = Σ CFₜ/(1+r)ᵗ − InitialInvestment` |
| `calculateOpportunityCost` | Compares compound future value of a chosen vs. foregone option; `OpportunityCost = FV(foregone) − FV(chosen)` |

All are pure functions (no React, no side effects). Run the checks yourself:

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

## 7. PWA & Android support — install via browser, or as an APK

Finma ships as an installable Progressive Web App:
- `public/manifest.webmanifest` — app name, icons, theme color, standalone
  display mode, and two shortcuts (Dashboard, Add transaction) that deep-link
  via `?page=...`, read in `App.jsx`
- `public/icons/` — 192px/512px icons plus a maskable variant for Android's
  adaptive icon shape (all verified as real 192×192 / 512×512 PNGs)
- `public/sw.js` — a runtime-caching service worker (network-first for
  navigation, stale-while-revalidate for assets), registered in `src/main.jsx`
- `src/components/common/InstallPrompt.jsx` — an in-app "Install Finma on
  your phone" banner, shown once per device until dismissed or installed:
  - **Android (Chrome/Edge/Samsung Internet):** captures the browser's
    `beforeinstallprompt` event and shows a one-tap **Install** button —
    no digging through browser menus required.
  - **iOS Safari:** never fires that event (Apple doesn't expose it), so
    instead shows the manual steps — Share icon → "Add to Home Screen".
  - Hidden automatically once already running standalone (i.e. already
    installed), via `display-mode: standalone` / `navigator.standalone`.

Once installed, Finma opens full-screen with no browser chrome, has its own
home-screen icon, and (thanks to the service worker) keeps working after
the very first load even with no connection.

### Building an actual installable `.apk`

The manifest + service worker above already meet every requirement Android
needs to wrap a PWA as a real installable APK (a "Trusted Web Activity") —
no extra code needed:

1. Deploy Finma (GitHub Pages, over HTTPS — required)
2. Go to **[pwabuilder.com](https://www.pwabuilder.com)**, enter your deployed URL
3. It scores the manifest/service worker automatically, then under
   **"Package for stores" → Android**, generates a signed `.apk` /
   `.aab` ready to sideload directly onto a phone or submit to the Play Store

This works because PWABuilder's Android packager (Google's Bubblewrap
under the hood) needs exactly what's already here: a valid manifest with
`name`, icons (192 + 512 + maskable), `start_url`, `display: standalone`,
served over HTTPS with a registered service worker.

## 8. Performance: fixing "slow to show" / white screen

Two changes address this together:

1. **Instant loading shell.** `index.html` has a small inline `<style>` +
   `#shell` spinner that paints immediately, before any JS downloads —
   so there's never a truly blank screen, even on a slow connection.
2. **Code-splitting.** `App.jsx` lazy-loads every page (`React.lazy` +
   `Suspense`) and `exportData.js` dynamically imports `xlsx` — so the
   first paint only needs the Dashboard's code, not every calculator plus
   the export library. `vite.config.js` also splits `vendor-react` and
   `vendor-xlsx` into separate cacheable chunks.

## 9. Deploying to GitHub Pages

`.github/workflows/deploy.yml` builds and publishes `dist/` automatically
on every push to `main` — no secrets needed anymore (there's no backend to
configure).

**One-time setup:** in your repo, go to **Settings → Pages → Source** and
select **"GitHub Actions"** (not "Deploy from a branch"). If it's left on
"Deploy from a branch", GitHub just serves your raw repository files
as-is — including the unbuilt `src/main.jsx` — which browsers can't
execute, producing a blank page or a stuck loading spinner.

`vite.config.js` uses `base: "./"` (relative asset paths), so the build
works identically at a domain root or under a GitHub Pages `/<repo>/`
subfolder — no configuration needed either way.

If you ever see a stuck spinner with a "taking longer than expected to
load" message: it means `src/main.jsx` never executed, almost always
because raw source is being served instead of the `dist/` build. Confirm
the Pages Source setting above, and check the **Actions** tab for a green
run.
