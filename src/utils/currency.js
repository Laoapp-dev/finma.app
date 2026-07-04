// Static metadata for the three supported currencies.
export const CURRENCIES = {
  LAK: { code: "LAK", symbol: "₭", decimals: 0, locale: "lo-LA" },
  THB: { code: "THB", symbol: "฿", decimals: 2, locale: "th-TH" },
  USD: { code: "USD", symbol: "$", decimals: 2, locale: "en-US" },
};

/**
 * Indicative FX rates expressed as "1 unit of currency = X USD".
 * In production, replace `getRates()` with a call to a live FX API
 * (e.g. exchangerate.host) and cache the response, e.g. in Firestore
 * with a `fetchedAt` timestamp, refreshed once every few hours.
 */
const FALLBACK_RATES_TO_USD = {
  LAK: 1 / 21000, // ~21,000 LAK per USD
  THB: 1 / 36, //   ~36 THB per USD
  USD: 1,
};

let cachedRates = { ...FALLBACK_RATES_TO_USD };

export function setRates(ratesToUsd) {
  cachedRates = { ...cachedRates, ...ratesToUsd };
}

export function getRates() {
  return cachedRates;
}

/** Convert an amount from one supported currency to another. */
export function convertCurrency(amount, from, to) {
  if (from === to) return amount;
  const rates = getRates();
  const amountInUsd = amount * rates[from];
  return amountInUsd / rates[to];
}

/** Format a number as currency using the given currency's symbol/decimals. */
export function formatCurrency(amount, currencyCode) {
  const meta = CURRENCIES[currencyCode] || CURRENCIES.USD;
  const formatted = Number(amount ?? 0).toLocaleString(meta.locale, {
    minimumFractionDigits: meta.decimals,
    maximumFractionDigits: meta.decimals,
  });
  return `${meta.symbol}${formatted}`;
}
