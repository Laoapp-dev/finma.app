import { useMemo, useState } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { useCurrency } from "../../context/CurrencyContext";
import { calculateNPV } from "../../utils/financeFormulas";
import { Card, ResultTile } from "../common/Card";
import { exportToCsv } from "../../utils/exportData";

export default function NPVCalculator() {
  const { t } = useLanguage();
  const { format, currency } = useCurrency();

  const [initialInvestment, setInitialInvestment] = useState(20000000);
  const [discountRate, setDiscountRate] = useState(10);
  const [cashFlows, setCashFlows] = useState([6000000, 7000000, 8000000, 8000000]);

  const result = useMemo(
    () => calculateNPV({ initialInvestment, discountRatePct: discountRate, cashFlows }),
    [initialInvestment, discountRate, cashFlows]
  );

  const updateCashFlow = (idx, value) => {
    setCashFlows((flows) => flows.map((f, i) => (i === idx ? Number(value) : f)));
  };

  const addYear = () => setCashFlows((flows) => [...flows, 0]);
  const removeYear = (idx) => setCashFlows((flows) => flows.filter((_, i) => i !== idx));

  const handleExport = () => exportToCsv(result.discountedFlows, "npv-cash-flows.csv");

  return (

      <Card title={t("calculators.npv.title")} subtitle={t("calculators.npv.subtitle")}>
        <div className="grid md:grid-cols-2 gap-4 mb-5">
          <div>
            <label className="label">{t("calculators.npv.initialInvestment")}</label>
            <input
              type="number"
              className="input"
              value={initialInvestment}
              onChange={(e) => setInitialInvestment(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="label">{t("calculators.npv.discountRate")}</label>
            <input
              type="number"
              step="0.01"
              className="input"
              value={discountRate}
              onChange={(e) => setDiscountRate(Number(e.target.value))}
            />
          </div>
        </div>

        <div className="space-y-2 mb-4">
          {cashFlows.map((cf, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <label className="label flex-1 min-w-0 mb-0">{t("calculators.npv.cashFlow", { year: idx + 1 })}</label>
              <input
                type="number"
                className="input w-24 sm:w-40 shrink-0"
                value={cf}
                onChange={(e) => updateCashFlow(idx, e.target.value)}
              />
              <button
                onClick={() => removeYear(idx)}
                className="text-ink/30 hover:text-lotus text-sm px-2"
                aria-label={t("calculators.npv.removeYear")}
              >
                ✕
              </button>
            </div>
          ))}
          <button onClick={addYear} className="btn-secondary text-sm">
            + {t("calculators.npv.addYear")}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <ResultTile
            label={t("calculators.npv.result")}
            value={format(result.npv, currency)}
            tone={result.isPositive ? "bamboo" : "lotus"}
          />
        </div>

        <p className={`text-sm mb-4 ${result.isPositive ? "text-bamboo" : "text-lotus"}`}>
          {result.isPositive ? t("calculators.npv.verdictPositive") : t("calculators.npv.verdictNegative")}
        </p>

        <button className="btn-secondary text-sm" onClick={handleExport}>
          {t("dashboard.exportCsv")}
        </button>
      </Card>

  );
}
