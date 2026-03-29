import { TICKER_MAP } from './config.js';

export function calcPositions(movements) {
  const map = {};

  movements.forEach(m => {
    const originalTicker = m.ticker;
    const displayTicker = TICKER_MAP[originalTicker] || originalTicker;
    const isBuy = m.way === "BUY";
    const isSell = m.way === "SELL";
    if (!isBuy && !isSell) return;

    if (!map[originalTicker]) {
      map[originalTicker] = {
        originalTicker,
        displayTicker,
        units: 0,
        totalEur: 0
      };
    }
    const pos = map[originalTicker];

    let units = m.baseAmt;
    let eurSpent = m.quoteAmt;

    if (m.feeCur === originalTicker) {
      units = m.baseAmt - m.feeAmt;
    } else if (m.feeCur === "EUR" && isBuy) {
      eurSpent = m.quoteAmt + m.feeAmt;
    }

    if (isBuy) {
      pos.totalEur += eurSpent;
      pos.units += units;
    } else if (isSell) {
      const avgPrice = pos.units > 0 ? pos.totalEur / pos.units : 0;
      pos.units -= units;
      pos.totalEur -= avgPrice * units;
      if (pos.units < 0) pos.units = 0;
      if (pos.totalEur < 0) pos.totalEur = 0;
    }
  });

  return Object.values(map)
    .filter(p => p.units > 0.000001)
    .map(p => ({
      ticker: p.displayTicker,
      originalTicker: p.originalTicker,
      units: p.units,
      avgPrice: p.units > 0 ? p.totalEur / p.units : 0,
      totalInvested: p.totalEur
    }));
}