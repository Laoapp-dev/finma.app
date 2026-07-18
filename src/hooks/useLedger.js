import { useCallback, useEffect, useMemo, useState } from "react";
import { useCurrency } from "../context/CurrencyContext";
import { monthKey } from "../utils/dateUtils";

/**
 * Storage layout (all in the browser's localStorage — no account, no
 * server, nothing leaves the device):
 *   finma.ledgerEntries -> JSON array of { id, date, type, category,
 *                           description, amount, currency, cycleKey }
 *   finma.monthlyCycles -> JSON object of { [yyyy-mm]: { openingBalance,
 *                           closed, closingBalance } }
 *
 * This mirrors the previous Firestore-backed shape 1:1 so the rest of the
 * app (Dashboard, Financial, Analytics) didn't need to change at all —
 * only where the data lives changed, not its structure or the API this
 * hook exposes.
 *
 * Trade-off worth knowing: data stays on this device/browser only. It
 * isn't backed up automatically and won't show up if you open Finma on a
 * different phone or after clearing browser data. Use the CSV/Excel
 * export on the Dashboard to keep a copy if that matters to you.
 */

const ENTRIES_KEY = "finma.ledgerEntries";
const CYCLES_KEY = "finma.monthlyCycles";

function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (err) {
    console.error(`Failed to read ${key} from localStorage:`, err);
    return fallback;
  }
}

function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return null;
  } catch (err) {
    console.error(`Failed to write ${key} to localStorage:`, err);
    return err;
  }
}

function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export function useLedger() {
  const { convert, currency: primaryCurrency } = useCurrency();

  const currentKey = monthKey();
  const [transactions, setTransactions] = useState(() => readJSON(ENTRIES_KEY, []));
  const [cycles, setCycles] = useState(() => readJSON(CYCLES_KEY, {}));
  const [rolloverNotice, setRolloverNotice] = useState(null);
  // Only realistic failure mode now is the browser's storage quota being
  // full — surfaced here instead of silently doing nothing, same idea as
  // the old Firestore error banner, just for a different underlying cause.
  const [ledgerError, setLedgerError] = useState(null);

  const netForCycle = useCallback(
    (cycleKey, txList) =>
      txList
        .filter((tx) => tx.cycleKey === cycleKey)
        .reduce((sum, tx) => {
          const amt = convert(Number(tx.amount) || 0, tx.currency, primaryCurrency);
          return sum + (tx.type === "income" ? amt : -amt);
        }, 0),
    [convert, primaryCurrency]
  );

  // ---------------------------------------------------------------------
  // Monthly roll-over: close out any still-open prior cycle(s) and carry
  // the balance into the current month, the first time the app is opened
  // in a given month. Runs once on mount.
  // ---------------------------------------------------------------------
  useEffect(() => {
    const allCycles = readJSON(CYCLES_KEY, {});

    if (allCycles[currentKey]) {
      return; // current month's cycle already exists — nothing to do
    }

    const openKeys = Object.keys(allCycles).filter((k) => !allCycles[k].closed);

    if (openKeys.length === 0) {
      // First time the ledger has ever been opened on this device.
      const fresh = { ...allCycles, [currentKey]: { openingBalance: 0, closed: false } };
      writeJSON(CYCLES_KEY, fresh);
      setCycles(fresh);
      return;
    }

    const allEntries = readJSON(ENTRIES_KEY, []);
    const updated = { ...allCycles };
    let carryBalance = 0;
    let lastClosedKey = null;

    // Close cycles in chronological order in case more than one was left
    // open (e.g. the app wasn't opened for a few months).
    openKeys.sort().forEach((key) => {
      const cycleData = updated[key];
      const net = netForCycle(key, allEntries);
      const closingBalance = round2((cycleData.openingBalance || 0) + net);
      updated[key] = { ...cycleData, closed: true, closingBalance };
      carryBalance = closingBalance;
      lastClosedKey = key;
    });

    updated[currentKey] = { openingBalance: carryBalance, closed: false };
    writeJSON(CYCLES_KEY, updated);
    setCycles(updated);

    if (lastClosedKey) {
      setRolloverNotice({ amount: carryBalance, fromKey: lastClosedKey });
    }
    // Intentionally runs once per mount, not on every currentKey/netForCycle
    // change — it's a one-time "is it a new month?" check, not a live sync.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentCycle = cycles[currentKey] || { openingBalance: 0, closed: false };

  const currentTransactions = useMemo(
    () =>
      transactions
        .filter((tx) => tx.cycleKey === currentKey)
        .sort((a, b) => new Date(b.date) - new Date(a.date)),
    [transactions, currentKey]
  );

  const currentBalance = round2((currentCycle.openingBalance || 0) + netForCycle(currentKey, transactions));

  const addTransaction = useCallback(async (tx) => {
    const entry = { ...tx, id: uid(), cycleKey: monthKey(new Date(tx.date)) };
    const next = [entry, ...readJSON(ENTRIES_KEY, [])];
    const err = writeJSON(ENTRIES_KEY, next);
    if (err) {
      setLedgerError(err);
      throw err;
    }
    setTransactions(next);
    setLedgerError(null);
  }, []);

  const deleteTransaction = useCallback(async (id) => {
    const next = readJSON(ENTRIES_KEY, []).filter((tx) => tx.id !== id);
    const err = writeJSON(ENTRIES_KEY, next);
    if (err) {
      setLedgerError(err);
      throw err;
    }
    setTransactions(next);
    setLedgerError(null);
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
    loadingLedger: false,
    ledgerError,
    clearLedgerError: () => setLedgerError(null),
  };
}
