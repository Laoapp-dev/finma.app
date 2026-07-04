import { useState } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { useCurrency } from "../../context/CurrencyContext";

const CATEGORY_KEYS = [
  "salary",
  "business",
  "food",
  "transport",
  "utilities",
  "rent",
  "health",
  "education",
  "savings",
  "other",
];

export default function TransactionForm({ onAdd }) {
  const { t } = useLanguage();
  const { currencies, currency: defaultCurrency } = useCurrency();

  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    type: "expense",
    category: "food",
    description: "",
    amount: "",
    currency: defaultCurrency,
  });

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.amount || Number(form.amount) <= 0) return;
    onAdd({ ...form, amount: Number(form.amount) });
    setForm((f) => ({ ...f, description: "", amount: "" }));
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-2 md:grid-cols-6 gap-3 items-end">
      <div className="col-span-1">
        <label className="label">{t("dashboard.date")}</label>
        <input type="date" className="input" value={form.date} onChange={update("date")} />
      </div>

      <div className="col-span-1">
        <label className="label">{t("dashboard.type")}</label>
        <select className="input" value={form.type} onChange={update("type")}>
          <option value="income">{t("dashboard.income")}</option>
          <option value="expense">{t("dashboard.expense")}</option>
        </select>
      </div>

      <div className="col-span-1">
        <label className="label">{t("dashboard.category")}</label>
        <select className="input" value={form.category} onChange={update("category")}>
          {CATEGORY_KEYS.map((c) => (
            <option key={c} value={c}>
              {t(`dashboard.categories.${c}`)}
            </option>
          ))}
        </select>
      </div>

      <div className="col-span-2 md:col-span-1">
        <label className="label">{t("dashboard.description")}</label>
        <input type="text" className="input" value={form.description} onChange={update("description")} />
      </div>

      <div className="col-span-1">
        <label className="label">{t("dashboard.amount")}</label>
        <input type="number" min="0" step="0.01" className="input" value={form.amount} onChange={update("amount")} />
      </div>

      <div className="col-span-1 flex gap-2">
        <select className="input" value={form.currency} onChange={update("currency")}>
          {Object.values(currencies).map((c) => (
            <option key={c.code} value={c.code}>
              {c.symbol} {c.code}
            </option>
          ))}
        </select>
      </div>

      <div className="col-span-2 md:col-span-6">
        <button type="submit" className="btn-primary w-full md:w-auto">
          {t("dashboard.addTransaction")}
        </button>
      </div>
    </form>
  );
}
