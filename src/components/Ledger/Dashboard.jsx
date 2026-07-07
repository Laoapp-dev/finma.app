import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend,
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
const PIE_PALETTE = ["#B85C55", "#C9A227", "#2F4C7A", "#4E7D5D", "#8A6FB0", "#D98E4A", "#5AA0A8", "#9B5C6B"];
const CHART_TYPES = ["bar", "line", "area", "pie"];

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
    ledgerError,
  } = useLedger();
  const [chartType, setChartType] = useState("bar");

  const income = currentTransactions
    .filter((tx) => tx.type === "income")
    .reduce((sum, tx) => sum + convert(Number(tx.amount) || 0, tx.currency || currency, currency), 0);
  const expense = currentTransactions
    .filter((tx) => tx.type === "expense")
    .reduce((sum, tx) => sum + convert(Number(tx.amount) || 0, tx.currency || currency, currency), 0);

  // Income vs. expense totals per category, in the primary currency —
  // feeds the switchable bar/line/area/pie "infographic" below.
  const categoryData = useMemo(() => {
    const totals = {};
    currentTransactions.forEach((tx) => {
      const amt = convert(Number(tx.amount) || 0, tx.currency || currency, currency);
      if (!totals[tx.category]) totals[tx.category] = { category: t(`dashboard.categories.${tx.category}`), income: 0, expense: 0 };
      totals[tx.category][tx.type] += amt;
    });
    return Object.values(totals);
  }, [currentTransactions, convert, currency, t]);

  // Pie needs one value per slice — expense breakdown by category is the
  // most useful single-series view (where is the money actually going).
  const expensePieData = useMemo(
    () => categoryData.filter((row) => row.expense > 0).map((row) => ({ name: row.category, value: round2(row.expense) })),
    [categoryData]
  );

  // Running balance day-by-day through the current month, so the
  // roll-over's opening balance visibly trends up/down as entries land.
  const balanceTrend = useMemo(() => {
    const sorted = [...currentTransactions].sort((a, b) => new Date(a.date) - new Date(b.date));
    let running = currentCycle.openingBalance || 0;
    const points = [{ date: t("dashboard.openingBalance"), balance: round2(running) }];
    sorted.forEach((tx) => {
      const amt = convert(Number(tx.amount) || 0, tx.currency || currency, currency);
      running += tx.type === "income" ? amt : -amt;
      points.push({ date: tx.date, balance: round2(running) });
    });
    return points;
  }, [currentTransactions, currentCycle.openingBalance, convert, currency, t]);

  return (
    <div className="space-y-6">
      {ledgerError && (
        <div className="rounded-xl bg-lotus-50 border border-lotus/30 px-4 py-3 text-sm text-lotus">
          {t("common.syncError", { message: ledgerError })}
        </div>
      )}

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

          <Card>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <h3 className="font-display font-semibold text-ink">{t("dashboard.charts.byCategory")}</h3>
              <div className="flex gap-1 bg-indigo-50 rounded-lg p-1">
                {CHART_TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() => setChartType(type)}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                      chartType === type ? "bg-white text-indigo-700 shadow-sm" : "text-ink/50 hover:text-ink"
                    }`}
                  >
                    {t(`dashboard.charts.type.${type}`)}
                  </button>
                ))}
              </div>
            </div>

            {categoryData.length === 0 ? (
              <p className="text-ink/50 text-sm py-6 text-center">{t("dashboard.noTransactions")}</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                {chartType === "bar" ? (
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="4 8" stroke="#D7E0EE" />
                    <XAxis dataKey="category" tick={{ fontSize: 12, fill: "#16233D99" }} />
                    <YAxis tick={{ fontSize: 12, fill: "#16233D99" }} width={70} />
                    <Tooltip formatter={(v) => format(v, currency)} />
                    <Legend />
                    <Bar dataKey="income" name={t("dashboard.income")} fill={CHART_COLORS.income} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expense" name={t("dashboard.expense")} fill={CHART_COLORS.expense} radius={[4, 4, 0, 0]} />
                  </BarChart>
                ) : chartType === "line" ? (
                  <LineChart data={categoryData}>
                    <CartesianGrid strokeDasharray="4 8" stroke="#D7E0EE" />
                    <XAxis dataKey="category" tick={{ fontSize: 12, fill: "#16233D99" }} />
                    <YAxis tick={{ fontSize: 12, fill: "#16233D99" }} width={70} />
                    <Tooltip formatter={(v) => format(v, currency)} />
                    <Legend />
                    <Line type="monotone" dataKey="income" name={t("dashboard.income")} stroke={CHART_COLORS.income} strokeWidth={2} />
                    <Line type="monotone" dataKey="expense" name={t("dashboard.expense")} stroke={CHART_COLORS.expense} strokeWidth={2} />
                  </LineChart>
                ) : chartType === "area" ? (
                  <AreaChart data={categoryData}>
                    <CartesianGrid strokeDasharray="4 8" stroke="#D7E0EE" />
                    <XAxis dataKey="category" tick={{ fontSize: 12, fill: "#16233D99" }} />
                    <YAxis tick={{ fontSize: 12, fill: "#16233D99" }} width={70} />
                    <Tooltip formatter={(v) => format(v, currency)} />
                    <Legend />
                    <Area type="monotone" dataKey="income" name={t("dashboard.income")} stroke={CHART_COLORS.income} fill={CHART_COLORS.income} fillOpacity={0.25} />
                    <Area type="monotone" dataKey="expense" name={t("dashboard.expense")} stroke={CHART_COLORS.expense} fill={CHART_COLORS.expense} fillOpacity={0.25} />
                  </AreaChart>
                ) : (
                  <PieChart>
                    <Tooltip formatter={(v) => format(v, currency)} />
                    <Legend />
                    <Pie data={expensePieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                      {expensePieData.map((entry, idx) => (
                        <Cell key={entry.name} fill={PIE_PALETTE[idx % PIE_PALETTE.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                )}
              </ResponsiveContainer>
            )}
            {chartType === "pie" && (
              <p className="text-ink/40 text-xs text-center mt-2">{t("dashboard.charts.pieNote")}</p>
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
