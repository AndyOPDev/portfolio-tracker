import { fmt, pct } from '../utils.js';

const { createElement: h } = React;

export function MetricCards({ totalValue, totalInvested, totalPL, totalPLPct, positionsCount, pricesCount }) {
  const cards = [
    ["Total value", "€" + fmt(totalValue), "Invested €" + fmt(totalInvested), "#fff"],
    ["P&L", (totalPL >= 0 ? "+" : "") + "€" + fmt(Math.abs(totalPL)), pct(totalPLPct), totalPL >= 0 ? "#30D158" : "#FF375F"],
    ["Positions", "" + positionsCount, pricesCount + " priced", "#fff"]
  ];

  return h("div", { style: { padding: "0 16px 16px", display: "flex", gap: 10 } },
    cards.map(([label, val, sub, color]) =>
      h("div", { key: label, style: { background: "#1C1C1E", borderRadius: 16, padding: "14px 12px", flex: 1 } },
        h("div", { style: { fontSize: 12, color: "#636366", marginBottom: 4 } }, label),
        h("div", { style: { fontSize: 20, fontWeight: 700, color } }, val),
        h("div", { style: { fontSize: 11, color: "#636366", marginTop: 2 } }, sub)
      )
    )
  );
}