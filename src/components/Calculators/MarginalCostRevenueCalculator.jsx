import { useMemo, useState } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { useCurrency } from "../../context/CurrencyContext";
import { calculateMarginalCostRevenue } from "../../utils/financeFormulas";
import { Card, ResultTile } from "../common/Card";
import AuthGate from "../common/AuthGate";

export default function MarginalCostRevenueCalculator() {
  const { t } = useLanguage();
  const { format, currency } = useCurrency();

  const [previousQuantity, setPreviousQuantity] = useState(100);
  const [newQuantity, setNewQuantity] = useState(110);
  const [previousCost, setPreviousCost] = useState(10000000);
  const [newCost, setNewCost] = useState(10800000);
  const [previousRevenue, setPreviousRevenue] = useState(20000000);
  const [newRevenue, setNewRevenue] = useState(21500000);

  const result = useMemo(
    () =>
      calculateMarginalCostRevenue({
        previousQuantity,
        newQuantity,
        previousCost,
        newCost,
        previousRevenue,
        newRevenue,
      }),
    [previousQuantity, newQuantity, previousCost, newCost, previousRevenue, newRevenue]
  );

  const verdictTone = result.verdict === "expand" ? "bamboo" : result.verdict === "reduce" ? "lotus" : "gold";

  return (
    <AuthGate variant="feature">
      <Card
        title={t("calculators.marginalCostRevenue.title")}
        subtitle={t("calculators.marginalCostRevenue.subtitle")}
      >
        <div className="grid md:grid-cols-2 gap-4 mb-5">
          <Field
            label={t("calculators.marginalCostRevenue.previousQuantity")}
            value={previousQuantity}
            onChange={setPreviousQuantity}
          />
          <Field
            label={t("calculators.marginalCostRevenue.newQuantity")}
            value={newQuantity}
            onChange={setNewQuantity}
          />
          <Field
            label={t("calculators.marginalCostRevenue.previousCost")}
            value={previousCost}
            onChange={setPreviousCost}
          />
          <Field label={t("calculators.marginalCostRevenue.newCost")} value={newCost} onChange={setNewCost} />
          <Field
            label={t("calculators.marginalCostRevenue.previousRevenue")}
            value={previousRevenue}
            onChange={setPreviousRevenue}
          />
          <Field
            label={t("calculators.marginalCostRevenue.newRevenue")}
            value={newRevenue}
            onChange={setNewRevenue}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <ResultTile
            label={t("calculators.marginalCostRevenue.marginalCost")}
            value={format(result.marginalCost, currency)}
            tone="lotus"
          />
          <ResultTile
            label={t("calculators.marginalCostRevenue.marginalRevenue")}
            value={format(result.marginalRevenue, currency)}
            tone="bamboo"
          />
          <ResultTile
            label={t("calculators.marginalCostRevenue.marginalProfit")}
            value={format(result.marginalProfit, currency)}
            tone={verdictTone}
          />
        </div>

        <p className={`text-sm ${verdictTone === "lotus" ? "text-lotus" : verdictTone === "bamboo" ? "text-bamboo" : "text-gold-700"}`}>
          {t(`calculators.marginalCostRevenue.verdict.${result.verdict}`)}
        </p>
      </Card>
    </AuthGate>
  );
}

function Field({ label, value, onChange }) {
  return (
    <div>
      <label className="label">{label}</label>
      <input type="number" className="input" value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  );
}
