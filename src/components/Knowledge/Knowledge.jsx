import { useLanguage } from "../../context/LanguageContext";
import { Card } from "../common/Card";

const TOPICS = ["fixedDeposit", "compoundInterest", "profitMargin", "npv", "opportunityCost"];

export default function Knowledge() {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-ink">{t("nav.knowledge")}</h1>
        <p className="text-ink/50 text-sm">{t("knowledge.subtitle")}</p>
      </div>

      {TOPICS.map((key) => (
        <Card key={key} title={t(`calculators.${key}.title`)}>
          <p className="text-ink/70 text-sm mb-3">{t(`knowledge.${key}.explanation`)}</p>
          <div className="bg-indigo-50 text-indigo-700 rounded-xl px-4 py-3 font-display font-semibold text-sm mb-3">
            {t(`knowledge.${key}.formula`)}
          </div>
          <p className="text-ink/60 text-sm">
            <span className="font-medium text-ink">{t("knowledge.whenToUse")}:</span>{" "}
            {t(`knowledge.${key}.whenToUse`)}
          </p>
        </Card>
      ))}
    </div>
  );
}
