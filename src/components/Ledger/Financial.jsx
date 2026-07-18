import { useLanguage } from "../../context/LanguageContext";
import { useLedger } from "../../hooks/useLedger";
import { Card } from "../common/Card";
import LedgerErrorBanner from "../common/LedgerErrorBanner";
import TransactionForm from "./TransactionForm";
import TransactionList from "./TransactionList";

export default function Financial() {
  const { t } = useLanguage();
  const { currentTransactions, addTransaction, deleteTransaction, ledgerError, clearLedgerError } =
    useLedger();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-ink">{t("nav.financial")}</h1>
        <p className="text-ink/50 text-sm">{t("financial.subtitle")}</p>
      </div>

      <LedgerErrorBanner error={ledgerError} onDismiss={clearLedgerError} />

      <div className="space-y-6">
        <Card>
          <TransactionForm onAdd={addTransaction} />
        </Card>

        <Card>
          <h3 className="font-display font-semibold text-ink mb-2">{t("dashboard.title")}</h3>
          <div className="stitch-divider mb-2" />
          <TransactionList transactions={currentTransactions} onDelete={deleteTransaction} />
        </Card>
      </div>
    </div>
  );
}
