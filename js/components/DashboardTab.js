import { getDisplayName, fmt, pct } from '../utils.js';

const { createElement: h } = React;

export function DashboardTab({ enriched, cardStyle, emptyCard }) {
  // Sort by current value (highest first)
  const sortedHoldings = [...enriched].sort((a, b) => b.currentValue - a.currentValue);
  
  // Best and worst performers by P&L %
  const sortedByPL = [...enriched].sort((a, b) => b.plPct - a.plPct);
  const bestPerformer = sortedByPL[0];
  const worstPerformer = sortedByPL[sortedByPL.length - 1];

  if (enriched.length === 0) {
    return emptyCard("No positions found. Check your movements sheet.");
  }

  return h("div", null,
    // All Holdings section
    h("div", { style: { ...cardStyle, marginTop: 0 } },
      h("div", { style: { fontSize: 16, fontWeight: 600, marginBottom: 12, paddingTop: 8 } }, "Holdings"),
      
      // Header row
      h("div", { style: { display: "flex", paddingBottom: 8, marginBottom: 8, borderBottom: "1px solid #2C2C2E", fontSize: 12, fontWeight: 600, color: "#636366" } },
        h("div", { style: { flex: 2 } }, "Asset"),
        h("div", { style: { flex: 1, textAlign: "right" } }, "Invested"),
        h("div", { style: { flex: 1, textAlign: "right" } }, "Value"),
        h("div", { style: { flex: 1, textAlign: "right" } }, "P&L"),
        h("div", { style: { flex: 1, textAlign: "right" } }, "P&L %")
      ),
      
      // Data rows - ALL holdings
      sortedHoldings.map((p, i) => {
        const plAmount = p.pl;
        const plAmountAbs = Math.abs(plAmount);
        
        return h("div", { key: p.ticker, style: { display: "flex", alignItems: "center", padding: "8px 0", borderBottom: i < sortedHoldings.length - 1 ? "0.5px solid #2C2C2E" : "none" } },
          // Asset info
          h("div", { style: { flex: 2, display: "flex", alignItems: "center", gap: 8 } },
            h("div", { style: { width: 28, height: 28, borderRadius: 8, background: p.color + "22", display: "flex", alignItems: "center", justifyContent: "center" } },
              h("span", { style: { fontSize: 11, fontWeight: 700, color: p.color } }, p.ticker.slice(0, 3))
            ),
            h("div", null,
              h("div", { style: { fontSize: 14, fontWeight: 600 } }, getDisplayName(p.ticker)),
              h("div", { style: { fontSize: 10, color: "#636366" } }, p.ticker)
            )
          ),
          // Invested amount
          h("div", { style: { flex: 1, textAlign: "right", fontSize: 13 } }, `€${fmt(p.totalInvested)}`),
          // Current value
          h("div", { style: { flex: 1, textAlign: "right", fontSize: 13, fontWeight: 500 } }, `€${fmt(p.currentValue)}`),
          // P&L in €
          h("div", { style: { flex: 1, textAlign: "right", fontSize: 13, fontWeight: 500, color: plAmount >= 0 ? "#30D158" : "#FF375F" } },
            `${plAmount >= 0 ? "+" : "-"}€${fmt(plAmountAbs)}`
          ),
          // P&L in %
          h("div", { style: { flex: 1, textAlign: "right", fontSize: 13, fontWeight: 600, color: p.plPct >= 0 ? "#30D158" : "#FF375F" } },
            pct(p.plPct)
          )
        );
      })
    ),

    // Best & Worst Performers
    h("div", { style: { display: "flex", gap: 12, marginTop: 12 } },
      // Best performer card
      h("div", { style: { flex: 1, background: "#1C1C1E", borderRadius: 16, padding: 14 } },
        h("div", { style: { fontSize: 12, color: "#636366", marginBottom: 4 } }, "Best Performer"),
        h("div", { style: { fontSize: 16, fontWeight: 600 } }, getDisplayName(bestPerformer?.ticker || "-")),
        h("div", { style: { display: "flex", alignItems: "baseline", gap: 8, marginTop: 6 } },
          h("span", { style: { fontSize: 20, fontWeight: 700, color: "#30D158" } }, 
            bestPerformer ? `${bestPerformer.pl >= 0 ? "+" : "-"}€${fmt(Math.abs(bestPerformer.pl))}` : "-"
          ),
          h("span", { style: { fontSize: 16, fontWeight: 600, color: bestPerformer?.plPct >= 0 ? "#30D158" : "#FF375F" } }, 
            bestPerformer ? `(${pct(bestPerformer.plPct)})` : "-"
          )
        )
      ),
      // Worst performer card
      h("div", { style: { flex: 1, background: "#1C1C1E", borderRadius: 16, padding: 14 } },
        h("div", { style: { fontSize: 12, color: "#636366", marginBottom: 4 } }, "Worst Performer"),
        h("div", { style: { fontSize: 16, fontWeight: 600 } }, getDisplayName(worstPerformer?.ticker || "-")),
        h("div", { style: { display: "flex", alignItems: "baseline", gap: 8, marginTop: 6 } },
          h("span", { style: { fontSize: 20, fontWeight: 700, color: "#FF375F" } }, 
            worstPerformer ? `${worstPerformer.pl >= 0 ? "+" : "-"}€${fmt(Math.abs(worstPerformer.pl))}` : "-"
          ),
          h("span", { style: { fontSize: 16, fontWeight: 600, color: worstPerformer?.plPct >= 0 ? "#30D158" : "#FF375F" } }, 
            worstPerformer ? `(${pct(worstPerformer.plPct)})` : "-"
          )
        )
      )
    )
  );
}