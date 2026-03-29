import { getDisplayName, fmt, pct } from '../utils.js';

const { createElement: h } = React;

export function PositionsTab({ enriched, totalValue, cardStyle, emptyCard }) {
  // Sort by % of portfolio (highest first)
  const sortedPositions = [...enriched].sort((a, b) => {
    const pctA = totalValue > 0 ? (a.currentValue / totalValue) * 100 : 0;
    const pctB = totalValue > 0 ? (b.currentValue / totalValue) * 100 : 0;
    return pctB - pctA;
  });

  if (sortedPositions.length === 0) {
    return emptyCard("No positions found. Check your movements sheet.");
  }

  return h("div", { style: cardStyle },
    // Header row - 6 columns
    h("div", { style: { 
      display: "flex", 
      padding: "12px 0", 
      marginBottom: 8, 
      borderBottom: "1px solid #2C2C2E", 
      fontSize: 12, 
      fontWeight: 600, 
      color: "#636366",
      position: "sticky",
      top: 0,
      background: "#1C1C1E",
      zIndex: 1
    } },
      h("div", { style: { flex: 2 } }, "Asset"),
      h("div", { style: { flex: 0.8, textAlign: "right" } }, "Units"),
      h("div", { style: { flex: 0.8, textAlign: "right" } }, "Avg Price"),
      h("div", { style: { flex: 0.8, textAlign: "right" } }, "Curr Price"),
      h("div", { style: { flex: 0.7, textAlign: "right" } }, "P&L %"),
      h("div", { style: { flex: 0.7, textAlign: "right" } }, "% Portfolio")
    ),
    
    // Data rows
    sortedPositions.map((p, i) => {
      const portfolioPct = totalValue > 0 ? (p.currentValue / totalValue) * 100 : 0;
      
      return h("div", { 
        key: p.ticker, 
        style: { 
          display: "flex", 
          alignItems: "center", 
          padding: "10px 0", 
          borderBottom: i < sortedPositions.length - 1 ? "0.5px solid #2C2C2E" : "none",
          fontSize: 13
        } 
      },
        // Asset (name + ticker)
        h("div", { style: { flex: 2, display: "flex", alignItems: "center", gap: 8 } },
          h("div", { style: { width: 28, height: 28, borderRadius: 8, background: p.color + "22", display: "flex", alignItems: "center", justifyContent: "center" } },
            h("span", { style: { fontSize: 11, fontWeight: 700, color: p.color } }, p.ticker.slice(0, 3))
          ),
          h("div", null,
            h("div", { style: { fontSize: 14, fontWeight: 600 } }, getDisplayName(p.ticker)),
            h("div", { style: { fontSize: 10, color: "#636366" } }, p.ticker)
          )
        ),
        // Units
        h("div", { style: { flex: 0.8, textAlign: "right", fontSize: 12 } }, fmt(p.units, 4)),
        // Avg Price
        h("div", { style: { flex: 0.8, textAlign: "right", fontSize: 12 } }, `€${fmt(p.avgPrice)}`),
        // Current Price
        h("div", { style: { flex: 0.8, textAlign: "right", fontSize: 12, fontWeight: 500 } }, 
          p.currentPrice > 0 ? `€${fmt(p.currentPrice)}` : "—"
        ),
        // P&L %
        h("div", { style: { flex: 0.7, textAlign: "right", fontSize: 12, fontWeight: 600, color: p.plPct >= 0 ? "#30D158" : "#FF375F" } },
          pct(p.plPct)
        ),
        // % Portfolio
        h("div", { style: { flex: 0.7, textAlign: "right", fontSize: 12, fontWeight: 500 } },
          h("span", { style: { background: "#2C2C2E", padding: "2px 8px", borderRadius: 12, fontSize: 11 } },
            isNaN(portfolioPct) ? "0.0%" : portfolioPct.toFixed(1) + "%"
          )
        )
      );
    })
  );
}