import { useMemo, useState } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { useCurrency } from "../../context/CurrencyContext";
import { calculateOpportunityCost } from "../../utils/financeFormulas";
import { Card, ResultTile } from "../common/Card";

const DEFAULT_OPTION = (name, investment, expectedReturnPct, years) => ({
  name,
  investment,
  expectedReturnPct,
  years,
});

export default function OpportunityCostCalculator() {
  const { t } = useLanguage();
  const { format, currency } = useCurrency();

  const [chosen, setChosen] = useState(DEFAULT_OPTION("Fixed Deposit", 10000000, 5, 5));
  const [foregone, setForegone] = useState(DEFAULT_OPTION("Stock Index Fund", 10000000, 9, 5));

  const result = useMemo(() => calculateOpportunityCost({ chosen, foregone }), [chosen, foregone]);

  return (

      <Card title={t("calculators.opportunityCost.title")} subtitle={t("calculators.opportunityCost.subtitle")}>
        <div className="grid md:grid-cols-2 gap-6 mb-5">
          <OptionForm label={t("calculators.opportunityCost.chosenLabel")} option={chosen} onChange={setChosen} t={t} />
          <OptionForm
            label={t("calculators.opportunityCost.foregoneLabel")}
            option={foregone}
            onChange={setForegone}
            t={t}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <ResultTile
            label={`${chosen.name} — ${t("calculators.opportunityCost.absoluteReturn")}`}
            value={format(result.chosen.absoluteReturn, currency)}
            tone="indigo"
          />
          <ResultTile
            label={`${foregone.name} — ${t("calculators.opportunityCost.absoluteReturn")}`}
            value={format(result.foregone.absoluteReturn, currency)}
            tone="gold"
          />
          <ResultTile
            label={t("calculators.opportunityCost.netAdvantage")}
            value={format(result.netAdvantage, currency)}
            tone={result.chosenIsBetter ? "bamboo" : "lotus"}
          />
        </div>

        <p className={`text-sm ${result.chosenIsBetter ? "text-bamboo" : "text-lotus"}`}>
          {result.chosenIsBetter
            ? t("calculators.opportunityCost.verdictChosenBetter", {
                amount: format(Math.abs(result.netAdvantage), currency),
              })
            : t("calculators.opportunityCost.verdictForegoneBetter", {
                amount: format(Math.abs(result.netAdvantage), currency),
              })}
        </p>
      </Card>

  );
}

function OptionForm({ label, option, onChange, t }) {
  const update = (field) => (e) =>
    onChange({ ...option, [field]: field === "name" ? e.target.value : Number(e.target.value) });

  return (
    <div className="space-y-3">
      <h3 className="font-display font-semibold text-ink">{label}</h3>
      <div>
        <label className="label">{t("calculators.opportunityCost.optionName")}</label>
        <input type="text" className="input" value={option.name} onChange={update("name")} />
      </div>
      <div>
        <label className="label">{t("calculators.opportunityCost.investment")}</label>
        <input type="number" className="input" value={option.investment} onChange={update("investment")} />
      </div>
      <div>
        <label className="label">{t("calculators.opportunityCost.expectedReturn")}</label>
        <input
          type="number"
          step="0.01"
          className="input"
          value={option.expectedReturnPct}
          onChange={update("expectedReturnPct")}
        />
      </div>
      <div>
        <label className="label">{t("calculators.opportunityCost.years")}</label>
        <input type="number" className="input" value={option.years} onChange={update("years")} />
      </div>
    </div>
  );
}
