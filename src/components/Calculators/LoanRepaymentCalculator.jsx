import { useMemo, useState } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { useCurrency } from "../../context/CurrencyContext";
import { calculateLoanRepayment } from "../../utils/financeFormulas";
import { Card, ResultTile } from "../common/Card";
import { exportToCsv } from "../../utils/exportData";

export default function LoanRepaymentCalculator() {
  const { t } = useLanguage();
  const { format, currency } = useCurrency();

  const [principal, setPrincipal] = useState(50000000);
  const [rate, setRate] = useState(9);
  const [termMonths, setTermMonths] = useState(36);

  const result = useMemo(
    () => calculateLoanRepayment({ principal, annualRatePct: rate, termMonths }),
    [principal, rate, termMonths]
  );

  const handleExport = () =>
    exportToCsv(
      [{ Principal: principal, "Rate (%)": rate, "Term (months)": termMonths, ...result }],
      "loan-repayment.csv"
    );

  return (

      <Card title={t("calculators.loanRepayment.title")} subtitle={t("calculators.loanRepayment.subtitle")}>
        <div className="grid md:grid-cols-3 gap-4 mb-5">
          <Field label={t("calculators.loanRepayment.principal")} value={principal} onChange={setPrincipal} />
          <Field label={t("calculators.loanRepayment.rate")} value={rate} onChange={setRate} step="0.01" />
          <Field label={t("calculators.loanRepayment.termMonths")} value={termMonths} onChange={setTermMonths} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <ResultTile
            label={t("calculators.loanRepayment.monthlyPayment")}
            value={format(result.monthlyPayment, currency)}
            tone="indigo"
          />
          <ResultTile
            label={t("calculators.loanRepayment.totalRepayment")}
            value={format(result.totalRepayment, currency)}
            tone="gold"
          />
          <ResultTile
            label={t("calculators.loanRepayment.totalInterest")}
            value={format(result.totalInterest, currency)}
            tone="lotus"
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
