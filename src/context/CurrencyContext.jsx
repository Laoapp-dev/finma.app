import { createContext, useContext, useMemo, useState, useCallback } from "react";
import { CURRENCIES, convertCurrency, formatCurrency } from "../utils/currency";

const CurrencyContext = createContext(null);
const STORAGE_KEY = "finma.currency";

export function CurrencyProvider({ children }) {
  const [currency, setCurrencyState] = useState(
    () => localStorage.getItem(STORAGE_KEY) || "LAK"
  );

  const setCurrency = useCallback((code) => {
    setCurrencyState(code);
    localStorage.setItem(STORAGE_KEY, code);
  }, []);

  const convert = useCallback((amount, from, to = currency) => convertCurrency(amount, from, to), [
    currency,
  ]);

  const format = useCallback((amount, code = currency) => formatCurrency(amount, code), [
    currency,
  ]);

  const value = useMemo(
    () => ({ currency, setCurrency, convert, format, currencies: CURRENCIES }),
    [currency, setCurrency, convert, format]
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within a CurrencyProvider");
  return ctx;
}
