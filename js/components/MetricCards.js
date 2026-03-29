import { fmt, pct } from '../utils.js';

const { createElement: h } = React;

export function MetricCards({ totalValue, totalInvested, totalPL, totalPLPct }) {
  const cards = [
    { label: "Total Value", value: "€" + fmt(totalValue), color: "#fff" },
    { label: "Invested", value: "€" + fmt(totalInvested), color: "#fff" },
    { label: "P&L (€)", value: (totalPL >= 0 ? "+" : "") + "€" + fmt(Math.abs(totalPL)), color: totalPL >= 0 ? "#30D158" : "#FF375F" },
    { label: "P&L (%)", value: pct(totalPLPct), color: totalPLPct >= 0 ? "#30D158" : "#FF375F" }
  ];

  const isMobile = window.innerWidth < 640;

  return h("div", {
    style: {
      display: "grid",
      gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
      gap: 10,
      padding: "0 16px 16px"
    }
  },
    cards.map(({ label, value, color }) =>
      h("div", {
        key: label,
        style: {
          background: "#1C1C1E",
          borderRadius: 16,
          padding: "14px 12px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          minHeight: 80
        }
      },
        h("div", { style: { fontSize: 12, color: "#636366", marginBottom: 4 } }, label),
        h("div", { style: { fontSize: 20, fontWeight: 700, color } }, value)
      )
    )
  );
}