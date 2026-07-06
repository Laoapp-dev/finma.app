import { useCallback, useEffect, useMemo, useState } from "react";
import {
  collection,
  doc,
  addDoc,
  deleteDoc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useCurrency } from "../context/CurrencyContext";
import { monthKey } from "../utils/dateUtils";

/**
 * Firestore layout (see firestore.rules for the matching security rules):
 *   users/{uid}/ledgerEntries/{entryId}   -> one document per transaction
 *   users/{uid}/monthlyCycles/{yyyy-mm}   -> { openingBalance, closed, closingBalance }
 *
 * Queries deliberately avoid filtering by cycleKey server-side (which would
 * need a composite index since it's combined with ordering) — instead we
 * subscribe to the whole ledgerEntries collection (ordered by date, a
 * single-field index Firestore creates automatically) and group by cycle
 * client-side. That's plenty fast for a personal ledger's data volume.
 */

function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function useLedger() {
  const { user } = useAuth();
  const { convert, currency: primaryCurrency } = useCurrency();

  const currentKey = monthKey();
  const [transactions, setTransactions] = useState([]);
  const [currentCycle, setCurrentCycle] = useState({ openingBalance: 0, closed: false });
  const [rolloverNotice, setRolloverNotice] = useState(null);
  const [loadingLedger, setLoadingLedger] = useState(Boolean(user));

  const ledgerRef = useCallback(
    () => collection(db, "users", user.uid, "ledgerEntries"),
    [user]
  );
  const cyclesRef = useCallback(
    () => collection(db, "users", user.uid, "monthlyCycles"),
    [user]
  );

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
  // Signed OUT: an empty, read-only ledger. AuthGate shows the "sign in
  // to save your data" prompt on top of it — there's no fake/demo content.
  // ---------------------------------------------------------------------
  useEffect(() => {
    if (user) return;
    setTransactions([]);
    setCurrentCycle({ openingBalance: 0, closed: false });
    setLoadingLedger(false);
  }, [user, currentKey]);

  // ---------------------------------------------------------------------
  // Signed IN: subscribe to Firestore + run the monthly roll-over engine.
  // ---------------------------------------------------------------------
  useEffect(() => {
    if (!user) return;
    setLoadingLedger(true);

    const unsubscribe = onSnapshot(
      query(ledgerRef(), orderBy("date", "desc")),
      (snapshot) => {
        setTransactions(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoadingLedger(false);
      },
      (err) => {
        console.error("Ledger subscription failed:", err);
        setLoadingLedger(false);
      }
    );

    return unsubscribe;
  }, [user, ledgerRef]);

  useEffect(() => {
    if (!user) return;

    async function runRollover() {
      const currentDoc = await getDoc(doc(cyclesRef(), currentKey));
      if (currentDoc.exists()) {
        setCurrentCycle(currentDoc.data());
        return;
      }

      // Current month's cycle doc doesn't exist yet — close any still-open
      // prior cycles and carry the balance forward.
      const openSnap = await getDocs(query(cyclesRef(), where("closed", "==", false)));

      if (openSnap.empty) {
        // First time this user has ever opened the ledger.
        const fresh = { openingBalance: 0, closed: false };
        await setDoc(doc(cyclesRef(), currentKey), fresh);
        setCurrentCycle(fresh);
        return;
      }

      const allEntriesSnap = await getDocs(ledgerRef());
      const allEntries = allEntriesSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

      let carryBalance = 0;
      let lastClosedKey = null;

      // Sort so cycles close in chronological order if more than one was
      // somehow left open (e.g. the app wasn't opened for several months).
      const openDocs = openSnap.docs.sort((a, b) => (a.id < b.id ? -1 : 1));

      for (const cycleDoc of openDocs) {
        const key = cycleDoc.id;
        const cycleData = cycleDoc.data();
        const net = netForCycle(key, allEntries);
        const closingBalance = round2((cycleData.openingBalance || 0) + net);
        await setDoc(doc(cyclesRef(), key), { ...cycleData, closed: true, closingBalance });
        carryBalance = closingBalance;
        lastClosedKey = key;
      }

      const newCycle = { openingBalance: carryBalance, closed: false };
      await setDoc(doc(cyclesRef(), currentKey), newCycle);
      setCurrentCycle(newCycle);

      if (lastClosedKey) {
        setRolloverNotice({ amount: carryBalance, fromKey: lastClosedKey });
      }
    }

    runRollover().catch((err) => console.error("Roll-over failed:", err));
  }, [user, currentKey, cyclesRef, ledgerRef, netForCycle]);

  const currentTransactions = useMemo(
    () =>
      transactions
        .filter((tx) => tx.cycleKey === currentKey)
        .sort((a, b) => new Date(b.date) - new Date(a.date)),
    [transactions, currentKey]
  );

  const currentBalance = round2((currentCycle.openingBalance || 0) + netForCycle(currentKey, transactions));

  const addTransaction = useCallback(
    async (tx) => {
      if (!user) return; // AuthGate prevents this UI path anyway
      await addDoc(ledgerRef(), {
        ...tx,
        cycleKey: monthKey(new Date(tx.date)),
      });
    },
    [user, ledgerRef]
  );

  const deleteTransaction = useCallback(
    async (id) => {
      if (!user) return;
      await deleteDoc(doc(ledgerRef(), id));
    },
    [user, ledgerRef]
  );

  return {
    currentCycleKey: currentKey,
    currentCycle,
    currentTransactions,
    currentBalance,
    addTransaction,
    deleteTransaction,
    rolloverNotice,
    clearRolloverNotice: () => setRolloverNotice(null),
    loadingLedger,
    isDemo: !user,
  };
}
