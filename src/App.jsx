import { useState } from "react";
import { useAuth } from "./context/AuthContext";
import { useLanguage } from "./context/LanguageContext";
import GoogleSignIn from "./components/Auth/GoogleSignIn";
import Navbar from "./components/common/Navbar";
import Dashboard from "./components/Ledger/Dashboard";
import FixedDepositCalculator from "./components/Calculators/FixedDepositCalculator";
import CompoundInterestCalculator from "./components/Calculators/CompoundInterestCalculator";
import NetProfitMarginCalculator from "./components/Calculators/NetProfitMarginCalculator";
import NPVCalculator from "./components/Calculators/NPVCalculator";
import OpportunityCostCalculator from "./components/Calculators/OpportunityCostCalculator";
import AccountSettings from "./components/Settings/AccountSettings";

const PAGES = {
  dashboard: Dashboard,
  fixedDeposit: FixedDepositCalculator,
  compoundInterest: CompoundInterestCalculator,
  profitMargin: NetProfitMarginCalculator,
  npv: NPVCalculator,
  opportunityCost: OpportunityCostCalculator,
  settings: AccountSettings,
};

export default function App() {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const [page, setPage] = useState("dashboard");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <p className="text-ink/50">{t("common.loading")}</p>
      </div>
    );
  }

  if (!user) {
    return <GoogleSignIn />;
  }

  const Page = PAGES[page] || Dashboard;

  return (
    <div className="min-h-screen bg-paper">
      <Navbar active={page} onNavigate={setPage} />
      <main className="max-w-5xl mx-auto px-4 py-6">
        <Page />
      </main>
    </div>
  );
}
