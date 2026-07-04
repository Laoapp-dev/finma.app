import { useMemo, useState } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { useCurrency } from "../../context/CurrencyContext";
import { calculateFixedDeposit } from "../../utils/financeFormulas";
import { Card, ResultTile } from "../common/Card";
import { exportToCsv } from "../../utils/exportData";

export default function FixedDepositCalculator() {
  const { t } = useLanguage();
  const { format, currency } = useCurrency();

  const [principal, setPrincipal] = useState(10000000);
  const [rate, setRate] = useState(4.5);
  const [termMonths, setTermMonths] = useState(12);

  const result = useMemo(
    () => calculateFixedDeposit({ principal, annualRatePct: rate, termMonths }),
    [principal, rate, termMonths]
  );

  const handleExport = () =>
    exportToCsv(
      [
        { Principal: principal, "Rate (%)": rate, "Term (months)": termMonths, ...result },
      ],
      "fixed-deposit.csv"
    );

  return (
    <Card title={t("calculators.fixedDeposit.title")} subtitle={t("calculators.fixedDeposit.subtitle")}>
      <div className="grid md:grid-cols-3 gap-4 mb-5">
        <Field label={t("calculators.fixedDeposit.principal")} value={principal} onChange={setPrincipal} />
        <Field label={t("calculators.fixedDeposit.rate")} value={rate} onChange={setRate} step="0.01" />
        <Field label={t("calculators.fixedDeposit.termMonths")} value={termMonths} onChange={setTermMonths} />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <ResultTile
          label={t("calculators.fixedDeposit.interestEarned")}
          value={format(result.interestEarned, currency)}
          tone="gold"
        />
        <ResultTile
          label={t("calculators.fixedDeposit.maturityValue")}
          value={format(result.maturityValue, currency)}
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
