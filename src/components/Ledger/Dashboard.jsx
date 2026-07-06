import { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { useLanguage } from "../../context/LanguageContext";
import { useCurrency } from "../../context/CurrencyContext";
import { useLedger } from "../../hooks/useLedger";
import { monthLabel } from "../../utils/dateUtils";
import { exportLedger } from "../../utils/exportData";
import { Card, ResultTile } from "../common/Card";
import AuthGate from "../common/AuthGate";

const CHART_COLORS = { income: "#4E7D5D", expense: "#B85C55", balance: "#2F4C7A" };

export default function Dashboard() {
  const { t } = useLanguage();
  const { format, currency, convert } = useCurrency();
  const {
    currentCycleKey,
    currentCycle,
    currentTransactions,
    currentBalance,
    rolloverNotice,
    clearRolloverNotice,
  } = useLedger();

  const income = currentTransactions
    .filter((tx) => tx.type === "income")
    .reduce((sum, tx) => sum + convert(Number(tx.amount) || 0, tx.currency, currency), 0);
  const expense = currentTransactions
    .filter((tx) => tx.type === "expense")
    .reduce((sum, tx) => sum + convert(Number(tx.amount) || 0, tx.currency, currency), 0);

  // Bar chart: income vs. expense totals per category, in the primary currency.
  const categoryData = useMemo(() => {
    const totals = {};
    currentTransactions.forEach((tx) => {
      const amt = convert(Number(tx.amount) || 0, tx.currency, currency);
      if (!totals[tx.category]) totals[tx.category] = { category: t(`dashboard.categories.${tx.category}`), income: 0, expense: 0 };
      totals[tx.category][tx.type] += amt;
    });
    return Object.values(totals);
  }, [currentTransactions, convert, currency, t]);

  // Area chart: running balance day-by-day through the current month, so
  // the roll-over's opening balance visibly trends up/down as entries land.
  const balanceTrend = useMemo(() => {
    const sorted = [...currentTransactions].sort((a, b) => new Date(a.date) - new Date(b.date));
    let running = currentCycle.openingBalance || 0;
    const points = [{ date: t("dashboard.openingBalance"), balance: round2(running) }];
    sorted.forEach((tx) => {
      const amt = convert(Number(tx.amount) || 0, tx.currency, currency);
      running += tx.type === "income" ? amt : -amt;
      points.push({ date: tx.date, balance: round2(running) });
    });
    return points;
  }, [currentTransactions, currentCycle.openingBalance, convert, currency, t]);

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

      <AuthGate>
        <div className="space-y-6">
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

          <Card title={t("dashboard.charts.byCategory")}>
            {categoryData.length === 0 ? (
              <p className="text-ink/50 text-sm py-6 text-center">{t("dashboard.noTransactions")}</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="4 8" stroke="#D7E0EE" />
                  <XAxis dataKey="category" tick={{ fontSize: 12, fill: "#16233D99" }} />
                  <YAxis tick={{ fontSize: 12, fill: "#16233D99" }} width={70} />
                  <Tooltip formatter={(v) => format(v, currency)} />
                  <Bar dataKey="income" name={t("dashboard.income")} fill={CHART_COLORS.income} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" name={t("dashboard.expense")} fill={CHART_COLORS.expense} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>

          <Card title={t("dashboard.charts.balanceTrend")}>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={balanceTrend}>
                <defs>
                  <linearGradient id="balanceFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CHART_COLORS.balance} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={CHART_COLORS.balance} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 8" stroke="#D7E0EE" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#16233D99" }} />
                <YAxis tick={{ fontSize: 12, fill: "#16233D99" }} width={70} />
                <Tooltip formatter={(v) => format(v, currency)} />
                <Area type="monotone" dataKey="balance" stroke={CHART_COLORS.balance} fill="url(#balanceFill)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-display font-semibold text-ink">{t("dashboard.exportCsv")} / {t("dashboard.exportExcel")}</h3>
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
          </Card>
        </div>
      </AuthGate>
    </div>
  );
}

function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}
