/**
 * Pure finance calculation functions.
 * Kept framework-free so they can be unit tested independently of React.
 */

// ---------------------------------------------------------------------------
// 1. Fixed Deposit — Simple Interest
//    I = P * (r / 100) * (t / 12)   where t is in months
// ---------------------------------------------------------------------------
export function calculateFixedDeposit({ principal, annualRatePct, termMonths }) {
  const P = Number(principal) || 0;
  const r = Number(annualRatePct) || 0;
  const t = Number(termMonths) || 0;

  const interestEarned = P * (r / 100) * (t / 12);
  const maturityValue = P + interestEarned;

  return {
    interestEarned: round2(interestEarned),
    maturityValue: round2(maturityValue),
  };
}

// ---------------------------------------------------------------------------
// 2. Compound Interest / Stock ROI — Future Value with recurring deposits
//    Lump sum growth:   FV_lump = P * (1 + r/n)^(n*t)
//    Annuity (deposits): FV_pmt = PMT * [((1 + r/n)^(n*t) - 1) / (r/n)]
//    Total FV = FV_lump + FV_pmt
//    n = compounding periods per year, deposits assumed to align with
//    each compounding period (e.g. monthly deposits with monthly compounding).
// ---------------------------------------------------------------------------
export function calculateCompoundInterest({
  principal,
  monthlyDeposit,
  annualRatePct,
  years,
  compoundingPerYear = 12, // 12 = monthly, 4 = quarterly, 1 = annually
}) {
  const P = Number(principal) || 0;
  const PMT = Number(monthlyDeposit) || 0;
  const r = (Number(annualRatePct) || 0) / 100;
  const t = Number(years) || 0;
  const n = Number(compoundingPerYear) || 12;

  const periods = n * t;
  const ratePerPeriod = r / n;

  // Contributions are modeled monthly regardless of compounding frequency,
  // so normalize PMT to a "per compounding period" contribution.
  const depositsPerPeriod = PMT * (12 / n);

  const growthFactor = ratePerPeriod === 0 ? 1 : Math.pow(1 + ratePerPeriod, periods);

  const futureValueLumpSum = P * growthFactor;

  const futureValueDeposits =
    ratePerPeriod === 0
      ? depositsPerPeriod * periods
      : depositsPerPeriod * ((growthFactor - 1) / ratePerPeriod);

  const futureValue = futureValueLumpSum + futureValueDeposits;
  const totalContributed = P + depositsPerPeriod * periods;
  const totalInterest = futureValue - totalContributed;

  return {
    futureValue: round2(futureValue),
    totalContributed: round2(totalContributed),
    totalInterest: round2(totalInterest),
  };
}

// ---------------------------------------------------------------------------
// 3. Net Profit Margin
//    Net Profit Margin (%) = (Net Profit / Gross Revenue) * 100
// ---------------------------------------------------------------------------
export function calculateNetProfitMargin({ grossRevenue, netProfit }) {
  const revenue = Number(grossRevenue) || 0;
  const profit = Number(netProfit) || 0;

  if (revenue === 0) return { marginPct: 0 };

  const marginPct = (profit / revenue) * 100;
  return { marginPct: round2(marginPct) };
}

// ---------------------------------------------------------------------------
// 4. Net Present Value (NPV)
//    NPV = sum( CF_t / (1 + r)^t ) - Initial Investment,  t = 1..n
// ---------------------------------------------------------------------------
export function calculateNPV({ initialInvestment, discountRatePct, cashFlows }) {
  const investment = Number(initialInvestment) || 0;
  const r = (Number(discountRatePct) || 0) / 100;

  const discountedFlows = (cashFlows || []).map((cf, idx) => {
    const t = idx + 1;
    const flow = Number(cf) || 0;
    const presentValue = flow / Math.pow(1 + r, t);
    return { year: t, cashFlow: flow, presentValue: round2(presentValue) };
  });

  const totalPresentValue = discountedFlows.reduce((sum, row) => sum + row.presentValue, 0);
  const npv = totalPresentValue - investment;

  return {
    npv: round2(npv),
    isPositive: npv >= 0,
    discountedFlows,
  };
}

// ---------------------------------------------------------------------------
// 5. Opportunity Cost Matrix
//    Absolute return (compound growth) for each option:
//      FV = Investment * (1 + r)^t
//    Opportunity cost of choosing A over B = FV(B) - FV(A)
//    (positive => B was the better foregone choice)
// ---------------------------------------------------------------------------
export function calculateOpportunityCost({ chosen, foregone }) {
  const chosenFV = compoundFutureValue(chosen.investment, chosen.expectedReturnPct, chosen.years);
  const foregoneFV = compoundFutureValue(
    foregone.investment,
    foregone.expectedReturnPct,
    foregone.years
  );

  const chosenReturn = chosenFV - (Number(chosen.investment) || 0);
  const foregoneReturn = foregoneFV - (Number(foregone.investment) || 0);

  // Opportunity cost = the return you gave up by not picking the other option.
  const opportunityCost = foregoneReturn - chosenReturn;
  const netAdvantage = -opportunityCost; // positive => chosen option wins

  return {
    chosen: { futureValue: round2(chosenFV), absoluteReturn: round2(chosenReturn) },
    foregone: { futureValue: round2(foregoneFV), absoluteReturn: round2(foregoneReturn) },
    opportunityCost: round2(opportunityCost),
    netAdvantage: round2(netAdvantage),
    chosenIsBetter: netAdvantage >= 0,
  };
}

function compoundFutureValue(investment, ratePct, years) {
  const P = Number(investment) || 0;
  const r = (Number(ratePct) || 0) / 100;
  const t = Number(years) || 0;
  return P * Math.pow(1 + r, t);
}

// ---------------------------------------------------------------------------
// 6. Marginal Cost & Marginal Revenue
//    MC = ΔTotal Cost / ΔQuantity = (TC2 - TC1) / (Q2 - Q1)
//    MR = ΔTotal Revenue / ΔQuantity = (TR2 - TR1) / (Q2 - Q1)
//    Comparing MR to MC tells you whether producing one more unit adds to
//    or subtracts from profit.
// ---------------------------------------------------------------------------
export function calculateMarginalCostRevenue({
  previousQuantity,
  newQuantity,
  previousCost,
  newCost,
  previousRevenue,
  newRevenue,
}) {
  const q1 = Number(previousQuantity) || 0;
  const q2 = Number(newQuantity) || 0;
  const deltaQ = q2 - q1;

  const tc1 = Number(previousCost) || 0;
  const tc2 = Number(newCost) || 0;
  const tr1 = Number(previousRevenue) || 0;
  const tr2 = Number(newRevenue) || 0;

  const marginalCost = deltaQ === 0 ? 0 : (tc2 - tc1) / deltaQ;
  const marginalRevenue = deltaQ === 0 ? 0 : (tr2 - tr1) / deltaQ;
  const marginalProfit = marginalRevenue - marginalCost;

  return {
    marginalCost: round2(marginalCost),
    marginalRevenue: round2(marginalRevenue),
    marginalProfit: round2(marginalProfit),
    // "expand" = produce more (MR > MC), "reduce" = produce less (MR < MC),
    // "optimal" = at the profit-maximizing point (MR ≈ MC).
    verdict: Math.abs(marginalProfit) < 0.005 ? "optimal" : marginalProfit > 0 ? "expand" : "reduce",
  };
}

// ---------------------------------------------------------------------------
// 7. Loan Repayment (amortizing loan)
//    Monthly payment: PMT = P * r * (1+r)^n / ((1+r)^n - 1)
//    where r = monthly interest rate, n = number of monthly payments.
//    Falls back to simple division when r = 0 (interest-free loan).
// ---------------------------------------------------------------------------
export function calculateLoanRepayment({ principal, annualRatePct, termMonths }) {
  const P = Number(principal) || 0;
  const n = Number(termMonths) || 0;
  const r = (Number(annualRatePct) || 0) / 100 / 12;

  if (n === 0) {
    return { monthlyPayment: 0, totalRepayment: 0, totalInterest: 0 };
  }

  const monthlyPayment = r === 0 ? P / n : (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  const totalRepayment = monthlyPayment * n;
  const totalInterest = totalRepayment - P;

  return {
    monthlyPayment: round2(monthlyPayment),
    totalRepayment: round2(totalRepayment),
    totalInterest: round2(totalInterest),
  };
}

// ---------------------------------------------------------------------------
// 8. Stock ROI & Dividend
//    Capital Gain = Sale Price - Purchase Price
//    Total Return = Capital Gain + Dividends Received
//    ROI (%) = (Total Return / Purchase Price) * 100
//    Dividend Yield (%) = (Dividends / Purchase Price) * 100
//    Annualized ROI (%) = ((1 + ROI/100)^(1/years) - 1) * 100, if years given.
// ---------------------------------------------------------------------------
export function calculateStockROIDividend({ purchasePrice, currentPrice, dividendsReceived, holdingYears }) {
  const P0 = Number(purchasePrice) || 0;
  const P1 = Number(currentPrice) || 0;
  const dividends = Number(dividendsReceived) || 0;
  const years = Number(holdingYears) || 0;

  const capitalGain = P1 - P0;
  const totalReturn = capitalGain + dividends;
  const roiPct = P0 === 0 ? 0 : (totalReturn / P0) * 100;
  const dividendYieldPct = P0 === 0 ? 0 : (dividends / P0) * 100;
  const annualizedRoiPct =
    years > 0 && 1 + roiPct / 100 > 0 ? (Math.pow(1 + roiPct / 100, 1 / years) - 1) * 100 : null;

  return {
    capitalGain: round2(capitalGain),
    totalReturn: round2(totalReturn),
    roiPct: round2(roiPct),
    dividendYieldPct: round2(dividendYieldPct),
    annualizedRoiPct: annualizedRoiPct === null ? null : round2(annualizedRoiPct),
  };
}

function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}
