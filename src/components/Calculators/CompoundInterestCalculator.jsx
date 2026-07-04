import { useMemo, useState } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { useCurrency } from "../../context/CurrencyContext";
import { calculateCompoundInterest } from "../../utils/financeFormulas";
import { Card, ResultTile } from "../common/Card";
import { exportToCsv } from "../../utils/exportData";

const FREQUENCIES = [
  { value: 12, key: "monthly" },
  { value: 4, key: "quarterly" },
  { value: 1, key: "annually" },
];

export default function CompoundInterestCalculator() {
  const { t } = useLanguage();
  const { format, currency } = useCurrency();

  const [principal, setPrincipal] = useState(5000000);
  const [monthlyDeposit, setMonthlyDeposit] = useState(500000);
  const [rate, setRate] = useState(7);
  const [years, setYears] = useState(10);
  const [compoundingPerYear, setCompoundingPerYear] = useState(12);

  const result = useMemo(
    () =>
      calculateCompoundInterest({
        principal,
        monthlyDeposit,
        annualRatePct: rate,
        years,
        compoundingPerYear,
      }),
    [principal, monthlyDeposit, rate, years, compoundingPerYear]
  );

  const handleExport = () =>
    exportToCsv(
      [
        {
          Principal: principal,
          "Monthly Deposit": monthlyDeposit,
          "Rate (%)": rate,
          Years: years,
          ...result,
        },
      ],
      "compound-interest.csv"
    );

  return (
    <Card title={t("calculators.compoundInterest.title")} subtitle={t("calculators.compoundInterest.subtitle")}>
      <div className="grid md:grid-cols-3 gap-4 mb-5">
        <Field label={t("calculators.compoundInterest.principal")} value={principal} onChange={setPrincipal} />
        <Field
          label={t("calculators.compoundInterest.monthlyDeposit")}
          value={monthlyDeposit}
          onChange={setMonthlyDeposit}
        />
        <Field label={t("calculators.compoundInterest.rate")} value={rate} onChange={setRate} step="0.01" />
        <Field label={t("calculators.compoundInterest.years")} value={years} onChange={setYears} />
        <div>
          <label className="label">{t("calculators.compoundInterest.compounding")}</label>
          <select
            className="input"
            value={compoundingPerYear}
            onChange={(e) => setCompoundingPerYear(Number(e.target.value))}
          >
            {FREQUENCIES.map((f) => (
              <option key={f.value} value={f.value}>
                {t(`calculators.compoundInterest.${f.key}`)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <ResultTile
          label={t("calculators.compoundInterest.futureValue")}
          value={format(result.futureValue, currency)}
          tone="gold"
        />
        <ResultTile
          label={t("calculators.compoundInterest.totalContributed")}
          value={format(result.totalContributed, currency)}
          tone="indigo"
        />
        <ResultTile
          label={t("calculators.compoundInterest.totalInterest")}
          value={format(result.totalInterest, currency)}
          tone="bamboo"
        />
      </div>

      <button className="btn-secondary text-sm" onClick={handleExport}>
        {t("dashboard.exportCsv")}
      </button>
    </Card>
  );
}

function Field({ label, value, onChange, step = "1" }) {
  return (
    <div>
      <label className="label">{label}</label>
      <input
        type="number"
        step={step}
        className="input"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}
