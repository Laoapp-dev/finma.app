import { useLanguage } from "../../context/LanguageContext";
import { useCurrency } from "../../context/CurrencyContext";
import { useLedger } from "../../hooks/useLedger";
import { monthLabel } from "../../utils/dateUtils";
import { exportLedger } from "../../utils/exportData";
import { Card, ResultTile } from "../common/Card";
import TransactionForm from "./TransactionForm";
import TransactionList from "./TransactionList";

export default function Dashboard() {
  const { t } = useLanguage();
  const { format, currency } = useCurrency();
  const {
    currentCycleKey,
    currentCycle,
    currentTransactions,
    currentBalance,
    addTransaction,
    deleteTransaction,
    rolloverNotice,
    clearRolloverNotice,
  } = useLedger();

  const income = currentTransactions
    .filter((t2) => t2.type === "income")
    .reduce((sum, t2) => sum + Number(t2.amount), 0);
  const expense = currentTransactions
    .filter((t2) => t2.type === "expense")
    .reduce((sum, t2) => sum + Number(t2.amount), 0);

  return (
    <div className="space-y-6">
      {rolloverNotice && (
        <div className="rounded-xl bg-gold-50 border border-gold-600/30 px-4 py-3 flex items-center justify-between">
          <p className="text-sm text-ink">
            {t("dashboard.rolloverNotice", {
              amount: format(rolloverNotice.amount, currency),
              month: monthLabel(rolloverNotice.fromKey),
            })}
          </p>
          <button onClick={clearRolloverNotice} className="text-ink/40 hover:text-ink">
            ✕
          </button>
        </div>
      )}

      <div>
        <h1 className="font-display font-bold text-2xl text-ink">{t("dashboard.title")}</h1>
        <p className="text-ink/50 text-sm">{monthLabel(currentCycleKey)}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <ResultTile label={t("dashboard.currentBalance")} value={format(currentBalance)} tone="indigo" />
        <ResultTile
          label={t("dashboard.openingBalance")}
          value={format(currentCycle.openingBalance || 0)}
          tone="gold"
        />
        <ResultTile label={t("dashboard.income")} value={format(income)} tone="bamboo" />
        <ResultTile label={t("dashboard.expense")} value={format(expense)} tone="lotus" />
      </div>

      <Card>
        <TransactionForm onAdd={addTransaction} />
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-display font-semibold text-ink">{t("dashboard.title")}</h3>
          <div className="flex gap-2">
            <button
              className="btn-secondary text-sm px-3 py-1.5"
              onClick={() => exportLedger(currentTransactions, "csv")}
            >
              {t("dashboard.exportCsv")}
            </button>
            <button
              className="btn-secondary text-sm px-3 py-1.5"
              onClick={() => exportLedger(currentTransactions, "excel")}
            >
              {t("dashboard.exportExcel")}
            </button>
          </div>
        </div>
        <div className="stitch-divider mb-2" />
        <TransactionList transactions={currentTransactions} onDelete={deleteTransaction} />
      </Card>
    </div>
  );
}
