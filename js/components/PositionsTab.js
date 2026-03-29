import { getDisplayName, fmt, fmtEur, pct } from '../utils.js';
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

  const isMobile = window.innerWidth < 640;

  return h("div", { style: cardStyle },
    // Header row
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
      h("div", { style: { flex: 1, textAlign: "right" } }, "Units"),
      h("div", { style: { flex: 1, textAlign: "right" } }, "Avg Price"),
      h("div", { style: { flex: 1, textAlign: "right" } }, "Curr Price")
    ),
    
    // Data rows
    sortedPositions.map((p, i) => {
      // Bitcoin needs more decimals for units
      const unitsDecimals = p.ticker === "BTC" ? 6 : 2;
      
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
        // Asset
        h("div", { style: { flex: 2, display: "flex", alignItems: "center", gap: 8, minWidth: 0 } },
          h("div", { style: { width: 28, height: 28, borderRadius: 8, background: p.color + "22", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 } },
            h("span", { style: { fontSize: 11, fontWeight: 700, color: p.color } }, p.ticker.slice(0, 4))
          ),
          h("div", { style: { minWidth: 0 } },
            h("div", { style: { fontSize: 14, fontWeight: 600 } }, getDisplayName(p.ticker))
          )
        ),
        // Units (more decimals for BTC)
        h("div", { style: { flex: 1, textAlign: "right", fontSize: 12 } }, fmt(p.units, unitsDecimals)),
        // Avg Price 
        h("div", { style: { flex: 1, textAlign: "right", fontSize: 12 } }, `€${fmt(p.avgPrice, 2)}`),
        // Current Price
        h("div", { style: { flex: 1, textAlign: "right", fontSize: 12, fontWeight: 500 } }, 
          p.currentPrice > 0 ? `€${fmt(p.currentPrice)}` : "—"
        )
      );
    })
  );
}