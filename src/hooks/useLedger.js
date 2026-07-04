import { useCallback, useEffect, useMemo, useState } from "react";
import { monthKey, previousMonthKey } from "../utils/dateUtils";
import { useCurrency } from "../context/CurrencyContext";

const STORAGE_KEY = "laokip.ledger.v1";

/**
 * Shape persisted to storage (and, in production, to Firestore under
 * users/{uid}/monthlyCycles/{yyyy-mm} + users/{uid}/ledgerEntries/{id}):
 *
 * {
 *   cycles: {
 *     "2026-06": { openingBalance: 500000, closed: true, closingBalance: 812000 },
 *     "2026-07": { openingBalance: 812000, closed: false }
 *   },
 *   transactions: [
 *     { id, cycleKey, date, type: "income"|"expense", category, description, amount, currency }
 *   ]
 * }
 */
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore corrupt storage */
  }
  const key = monthKey();
  return {
    cycles: { [key]: { openingBalance: 0, closed: false } },
    transactions: [],
  };
}

function persist(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function useLedger() {
  const { convert, currency: primaryCurrency } = useCurrency();
  const [state, setState] = useState(loadState);
  const [rolloverNotice, setRolloverNotice] = useState(null);

  // -------------------------------------------------------------------
  // Monthly Roll-over Engine
  // Runs on mount (and can be re-run e.g. via a daily interval/cron in
  // production). Detects whether "now" belongs to a month that doesn't
  // yet exist in `cycles`. If so, it closes out every prior open cycle:
  // remaining balance = opening balance + (income - expenses), converted
  // to the primary currency, and carries it forward as the new cycle's
  // opening balance.
  // -------------------------------------------------------------------
  const runRollover = useCallback(() => {
    setState((prev) => {
      const currentKey = monthKey();
      if (prev.cycles[currentKey]) return prev; // already up to date

      const cycles = { ...prev.cycles };
      const sortedOpenKeys = Object.keys(cycles)
        .filter((k) => !cycles[k].closed)
        .sort();

      let carryBalance = 0;
      let lastClosedKey = null;

      sortedOpenKeys.forEach((key) => {
        const net = netForCycle(prev.transactions, key, convert, primaryCurrency);
        const closingBalance = round2((cycles[key].openingBalance || 0) + net);
        cycles[key] = { ...cycles[key], closed: true, closingBalance };
        carryBalance = closingBalance;
        lastClosedKey = key;
      });

      cycles[currentKey] = { openingBalance: carryBalance, closed: false };

      if (lastClosedKey) {
        setRolloverNotice({ amount: carryBalance, fromKey: lastClosedKey });
      }

      const next = { ...prev, cycles };
      persist(next);
      return next;
    });
  }, [convert, primaryCurrency]);

  useEffect(() => {
    runRollover();
    // Re-check once a day in case the tab stays open across midnight on the 1st.
    const interval = setInterval(runRollover, 1000 * 60 * 60);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentKey = monthKey();
  const currentCycle = state.cycles[currentKey] || { openingBalance: 0, closed: false };

  const currentTransactions = useMemo(
    () =>
      state.transactions
        .filter((tx) => tx.cycleKey === currentKey)
        .sort((a, b) => new Date(b.date) - new Date(a.date)),
    [state.transactions, currentKey]
  );

  const currentBalance = useMemo(() => {
    const net = netForCycle(state.transactions, currentKey, convert, primaryCurrency);
    return round2((currentCycle.openingBalance || 0) + net);
  }, [state.transactions, currentKey, currentCycle.openingBalance, convert, primaryCurrency]);

  const addTransaction = useCallback((tx) => {
    setState((prev) => {
      const next = {
        ...prev,
        transactions: [
          ...prev.transactions,
          {
            id: crypto.randomUUID(),
            cycleKey: monthKey(new Date(tx.date)),
            ...tx,
          },
        ],
      };
      persist(next);
      return next;
    });
  }, []);

  const deleteTransaction = useCallback((id) => {
    setState((prev) => {
      const next = { ...prev, transactions: prev.transactions.filter((t) => t.id !== id) };
      persist(next);
      return next;
    });
  }, []);

  return {
    currentCycleKey: currentKey,
    currentCycle,
    currentTransactions,
    currentBalance,
    addTransaction,
    deleteTransaction,
    rolloverNotice,
    clearRolloverNotice: () => setRolloverNotice(null),
    allTransactions: state.transactions,
  };
}

function netForCycle(transactions, cycleKey, convert, primaryCurrency) {
  return transactions
    .filter((tx) => tx.cycleKey === cycleKey)
    .reduce((sum, tx) => {
      const amountInPrimary = convert(Number(tx.amount) || 0, tx.currency, primaryCurrency);
      return sum + (tx.type === "income" ? amountInPrimary : -amountInPrimary);
    }, 0);
}

function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}
