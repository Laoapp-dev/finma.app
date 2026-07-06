import { useMemo, useState } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { calculateNetProfitMargin } from "../../utils/financeFormulas";
import { Card, ResultTile } from "../common/Card";
import AuthGate from "../common/AuthGate";

export default function NetProfitMarginCalculator() {
  const { t } = useLanguage();

  const [grossRevenue, setGrossRevenue] = useState(50000000);
  const [netProfit, setNetProfit] = useState(7500000);

  const result = useMemo(
    () => calculateNetProfitMargin({ grossRevenue, netProfit }),
    [grossRevenue, netProfit]
  );

  const tone = result.marginPct >= 0 ? "bamboo" : "lotus";

  return (
    <AuthGate variant="feature">
      <Card title={t("calculators.profitMargin.title")} subtitle={t("calculators.profitMargin.subtitle")}>
        <div className="grid md:grid-cols-2 gap-4 mb-5">
          <div>
            <label className="label">{t("calculators.profitMargin.grossRevenue")}</label>
            <input
              type="number"
              className="input"
              value={grossRevenue}
              onChange={(e) => setGrossRevenue(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="label">{t("calculators.profitMargin.netProfit")}</label>
            <input
              type="number"
              className="input"
              value={netProfit}
              onChange={(e) => setNetProfit(Number(e.target.value))}
            />
          </div>
        </div>

        <ResultTile label={t("calculators.profitMargin.result")} value={`${result.marginPct}%`} tone={tone} />
      </Card>
    </AuthGate>
  );
}
