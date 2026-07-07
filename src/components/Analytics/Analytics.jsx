import { useMemo } from "react";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";
import { useLanguage } from "../../context/LanguageContext";
import { useCurrency } from "../../context/CurrencyContext";
import { useLedger } from "../../hooks/useLedger";
import { monthLabel } from "../../utils/dateUtils";
import { exportToCsv } from "../../utils/exportData";
import { Card, ResultTile } from "../common/Card";
import AuthGate from "../common/AuthGate";

const PIE_PALETTE = ["#B85C55", "#C9A227", "#2F4C7A", "#4E7D5D", "#8A6FB0", "#D98E4A", "#5AA0A8", "#9B5C6B"];

export default function Analytics() {
  const { t } = useLanguage();
  const { format, currency, convert } = useCurrency();
  const { currentCycleKey, currentTransactions, ledgerError } = useLedger();

  const income = currentTransactions
    .filter((tx) => tx.type === "income")
    .reduce((sum, tx) => sum + convert(Number(tx.amount) || 0, tx.currency || currency, currency), 0);
  const expense = currentTransactions
    .filter((tx) => tx.type === "expense")
    .reduce((sum, tx) => sum + convert(Number(tx.amount) || 0, tx.currency || currency, currency), 0);

  const savingsRatePct = income === 0 ? 0 : round2(((income - expense) / income) * 100);
  const expenseRatioPct = income === 0 ? 0 : round2((expense / income) * 100);

  // Expense breakdown ranked by size, with each category's share of total spend.
  const categoryBreakdown = useMemo(() => {
    const totals = {};
    currentTransactions
      .filter((tx) => tx.type === "expense")
      .forEach((tx) => {
        const amt = convert(Number(tx.amount) || 0, tx.currency || currency, currency);
        const label = t(`dashboard.categories.${tx.category}`);
        totals[label] = (totals[label] || 0) + amt;
      });
    const rows = Object.entries(totals).map(([name, value]) => ({ name, value: round2(value) }));
    rows.sort((a, b) => b.value - a.value);
    const total = rows.reduce((sum, r) => sum + r.value, 0);
    return rows.map((r) => ({ ...r, pct: total === 0 ? 0 : round2((r.value / total) * 100) }));
  }, [currentTransactions, convert, currency, t]);

  const handleExport = () =>
    exportToCsv(
      categoryBreakdown.map((r) => ({
        [t("dashboard.category")]: r.name,
        [t("dashboard.amount")]: r.value,
        "% of spend": r.pct,
      })),
      "finma-analytics.csv"
    );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-ink">{t("nav.analytics")}</h1>
        <p className="text-ink/50 text-sm">{monthLabel(currentCycleKey)}</p>
      </div>

      {ledgerError && (
        <div className="rounded-xl bg-lotus-50 border border-lotus/30 px-4 py-3 text-sm text-lotus">
          {t("common.syncError", { message: ledgerError })}
        </div>
      )}

      <AuthGate>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3">
            <ResultTile
              label={t("analytics.savingsRate")}
              value={`${savingsRatePct}%`}
              tone={savingsRatePct >= 0 ? "bamboo" : "lotus"}
            />
            <ResultTile label={t("analytics.expenseRatio")} value={`${expenseRatioPct}%`} tone="gold" />
          </div>

          <Card title={t("analytics.breakdownTitle")}>
            {categoryBreakdown.length === 0 ? (
              <p className="text-ink/50 text-sm py-6 text-center">{t("dashboard.noTransactions")}</p>
            ) : (
              <div className="grid md:grid-cols-2 gap-6 items-center">
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Tooltip formatter={(v) => format(v, currency)} />
                    <Legend />
                    <Pie data={categoryBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90}>
                      {categoryBreakdown.map((entry, idx) => (
                        <Cell key={entry.name} fill={PIE_PALETTE[idx % PIE_PALETTE.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>

                <div className="space-y-2">
                  {categoryBreakdown.map((row, idx) => (
                    <div key={row.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="h-2.5 w-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: PIE_PALETTE[idx % PIE_PALETTE.length] }}
                        />
                        <span className="text-ink/70 truncate">{row.name}</span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-ink/50">{row.pct}%</span>
                        <span className="font-medium text-ink">{format(row.value, currency)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          <Card>
            <button className="btn-secondary text-sm" onClick={handleExport}>
              {t("dashboard.exportCsv")}
            </button>
          </Card>
        </div>
      </AuthGate>
    </div>
  );
}

function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}
