import { useState, lazy, Suspense } from "react";
import { useLanguage } from "./context/LanguageContext";
import { useAuth } from "./context/AuthContext";
import { useAppConfig } from "./hooks/useAppConfig";
import { isFirebaseConfigured } from "./firebase";
import ConfigError from "./components/common/ConfigError";
import MaintenanceScreen from "./components/common/MaintenanceScreen";
import Sidebar from "./components/common/Sidebar";
import Topbar from "./components/common/Topbar";

// Lazy-loaded: each page's JS is only downloaded when the user actually
// navigates to it, instead of all being bundled into the initial payload.
// Combined with dynamic-importing xlsx (see utils/exportData.js), this is
// the main fix for the app feeling slow to appear on first load.
const Dashboard = lazy(() => import("./components/Ledger/Dashboard"));
const Financial = lazy(() => import("./components/Ledger/Financial"));
const FixedDepositCalculator = lazy(() => import("./components/Calculators/FixedDepositCalculator"));
const CompoundInterestCalculator = lazy(() => import("./components/Calculators/CompoundInterestCalculator"));
const NetProfitMarginCalculator = lazy(() => import("./components/Calculators/NetProfitMarginCalculator"));
const NPVCalculator = lazy(() => import("./components/Calculators/NPVCalculator"));
const OpportunityCostCalculator = lazy(() => import("./components/Calculators/OpportunityCostCalculator"));
const Knowledge = lazy(() => import("./components/Knowledge/Knowledge"));
const AccountSettings = lazy(() => import("./components/Settings/AccountSettings"));
const AdminPanel = lazy(() => import("./components/Admin/AdminPanel"));

const PAGES = {
  dashboard: Dashboard,
  financial: Financial,
  fixedDeposit: FixedDepositCalculator,
  compoundInterest: CompoundInterestCalculator,
  profitMargin: NetProfitMarginCalculator,
  npv: NPVCalculator,
  opportunityCost: OpportunityCostCalculator,
  knowledge: Knowledge,
  settings: AccountSettings,
  admin: AdminPanel,
};

// Fixed Deposit is a free-trial tool (no sign-in needed), so it's the
// landing page — visitors see a working calculator immediately instead of
// a locked ledger.
const DEFAULT_PAGE = "fixedDeposit";

function PageSpinner() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="h-8 w-8 rounded-full border-2 border-indigo-200 border-t-indigo-600 animate-spin" />
    </div>
  );
}

export default function App() {
  const { t } = useLanguage();
  const { isAdmin } = useAuth();
  const { maintenanceMode, loading: configLoading } = useAppConfig();
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!isFirebaseConfigured) {
    return <ConfigError />;
  }

  // Everyone except the admin sees a maintenance notice while it's enabled,
  // so the admin can always get in to flip it back off.
  if (!configLoading && maintenanceMode && !isAdmin) {
    return <MaintenanceScreen />;
  }

  const Page = PAGES[page] || FixedDepositCalculator;

  return (
    <div className="min-h-screen bg-paper md:flex">
      <Sidebar
        active={page}
        onNavigate={(p) => {
          setPage(p);
          setSidebarOpen(false);
        }}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 min-w-0">
        <Topbar onMenuClick={() => setSidebarOpen(true)} pageTitle={t(`nav.${page}`)} />
        <main className="max-w-5xl mx-auto px-4 py-6">
          <Suspense fallback={<PageSpinner />}>
            <Page />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
