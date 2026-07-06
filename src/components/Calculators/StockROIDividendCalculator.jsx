import { useMemo, useState } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { useCurrency } from "../../context/CurrencyContext";
import { calculateStockROIDividend } from "../../utils/financeFormulas";
import { Card, ResultTile } from "../common/Card";
import AuthGate from "../common/AuthGate";

export default function StockROIDividendCalculator() {
  const { t } = useLanguage();
  const { format, currency } = useCurrency();

  const [purchasePrice, setPurchasePrice] = useState(1000000);
  const [currentPrice, setCurrentPrice] = useState(1200000);
  const [dividendsReceived, setDividendsReceived] = useState(50000);
  const [holdingYears, setHoldingYears] = useState(2);

  const result = useMemo(
    () => calculateStockROIDividend({ purchasePrice, currentPrice, dividendsReceived, holdingYears }),
    [purchasePrice, currentPrice, dividendsReceived, holdingYears]
  );

  const tone = result.totalReturn >= 0 ? "bamboo" : "lotus";

  return (
    <AuthGate variant="feature">
      <Card
        title={t("calculators.stockRoiDividend.title")}
        subtitle={t("calculators.stockRoiDividend.subtitle")}
      >
        <div className="grid md:grid-cols-2 gap-4 mb-5">
          <Field
            label={t("calculators.stockRoiDividend.purchasePrice")}
            value={purchasePrice}
            onChange={setPurchasePrice}
          />
          <Field
            label={t("calculators.stockRoiDividend.currentPrice")}
            value={currentPrice}
            onChange={setCurrentPrice}
          />
          <Field
            label={t("calculators.stockRoiDividend.dividendsReceived")}
            value={dividendsReceived}
            onChange={setDividendsReceived}
          />
          <Field
            label={t("calculators.stockRoiDividend.holdingYears")}
            value={holdingYears}
            onChange={setHoldingYears}
            step="0.1"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
          <ResultTile
            label={t("calculators.stockRoiDividend.capitalGain")}
            value={format(result.capitalGain, currency)}
            tone={result.capitalGain >= 0 ? "bamboo" : "lotus"}
          />
          <ResultTile
            label={t("calculators.stockRoiDividend.totalReturn")}
            value={format(result.totalReturn, currency)}
            tone={tone}
          />
          <ResultTile label={t("calculators.stockRoiDividend.roiPct")} value={`${result.roiPct}%`} tone={tone} />
          <ResultTile
            label={t("calculators.stockRoiDividend.dividendYieldPct")}
            value={`${result.dividendYieldPct}%`}
            tone="gold"
          />
          {result.annualizedRoiPct !== null && (
            <ResultTile
              label={t("calculators.stockRoiDividend.annualizedRoiPct")}
              value={`${result.annualizedRoiPct}%`}
              tone="indigo"
            />
          )}
        </div>
      </Card>
    </AuthGate>
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
