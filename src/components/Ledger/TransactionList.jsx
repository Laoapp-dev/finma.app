import { useLanguage } from "../../context/LanguageContext";
import { formatCurrency } from "../../utils/currency";

export default function TransactionList({ transactions, onDelete }) {
  const { t } = useLanguage();

  if (transactions.length === 0) {
    return <p className="text-ink/50 text-sm py-6 text-center">{t("dashboard.noTransactions")}</p>;
  }

  return (
    <div className="divide-y divide-indigo-50">
      {transactions.map((tx) => (
        <div key={tx.id} className="flex items-center justify-between py-3 gap-3">
          <div className="min-w-0">
            <p className="font-medium text-ink truncate">
              {tx.description || t(`dashboard.categories.${tx.category}`)}
            </p>
            <p className="text-xs text-ink/50">
              {tx.date} · {t(`dashboard.categories.${tx.category}`)}
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span
              className={`font-display font-semibold ${
                tx.type === "income" ? "text-bamboo" : "text-lotus"
              }`}
            >
              {tx.type === "income" ? "+" : "-"}
              {formatCurrency(tx.amount, tx.currency)}
            </span>
            <button
              onClick={() => onDelete(tx.id)}
              className="text-ink/30 hover:text-lotus transition-colors text-sm"
              aria-label={t("common.delete")}
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
