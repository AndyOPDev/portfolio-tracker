import { getDisplayName, fmt, fmtEur, pct } from '../utils.js';

const { createElement: h } = React;

export function DashboardTab({ enriched, cardStyle, emptyCard }) {
  if (enriched.length === 0) {
    return emptyCard("No positions found. Check your movements sheet.");
  }

  // Sort by current value (highest first)
  const sortedHoldings = [...enriched].sort((a, b) => b.currentValue - a.currentValue);

  // Best and worst performers by P&L %
  const sortedByPL = [...enriched].sort((a, b) => b.plPct - a.plPct);
  const bestPerformer = sortedByPL[0];
  const worstPerformer = sortedByPL[sortedByPL.length - 1];

  const isMobile = window.innerWidth < 640;

  // Helper for units formatting (BTC gets 6 decimals, others get 2)
  const formatUnits = (ticker, units) => {
    const isBTC = ticker === 'BTC' || ticker === 'BTC-USD';
    return fmt(units, isBTC ? 6 : 2);
  };

  // Shared card background
  const cardBg = { background: "#1C1C1E", borderRadius: 16 };

  return h("div", { style: { ...cardBg, marginBottom: 12, overflow: "hidden" } },
    // Holdings header
    h("div", { style: { fontSize: 16, fontWeight: 600, padding: "16px 16px 8px 16px" } }, "Holdings"),

    // Header row - desktop
    !isMobile && h("div", { style: { display: "flex", padding: "0 16px 8px 16px", borderBottom: "1px solid #2C2C2E", fontSize: 12, fontWeight: 600, color: "#636366" } },
      h("div", { style: { flex: 2 } }, "Asset"),
      h("div", { style: { flex: 0.8, textAlign: "right" } }, "Units"),
      h("div", { style: { flex: 0.8, textAlign: "right" } }, "Avg Price"),
      h("div", { style: { flex: 0.8, textAlign: "right" } }, "Curr Price"),
      h("div", { style: { flex: 0.8, textAlign: "right" } }, "Value"),
      h("div", { style: { flex: 0.7, textAlign: "right" } }, "P&L €"),
      h("div", { style: { flex: 0.7, textAlign: "right" } }, "P&L %")
    ),

    // Data rows
    sortedHoldings.map((p, i) => {
      const plAmount = p.pl;
      const plAmountAbs = Math.abs(plAmount);
      const isPositive = plAmount >= 0;
      const isLast = i === sortedHoldings.length - 1;

      // Desktop layout
      if (!isMobile) {
        return h("div", { 
          key: p.ticker, 
          style: { 
            display: "flex", 
            alignItems: "center", 
            padding: "12px 16px",
            borderBottom: !isLast ? "0.5px solid #2C2C2E" : "none"
          } 
        },
          h("div", { style: { flex: 2, display: "flex", alignItems: "center", gap: 12 } },
            h("div", { style: { width: 36, height: 36, borderRadius: 10, background: p.color + "22", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 } },
              h("span", { style: { fontSize: 13, fontWeight: 700, color: p.color } }, p.ticker)
            ),
            h("div", null,
              h("div", { style: { fontSize: 14, fontWeight: 600 } }, getDisplayName(p.ticker))
            )
          ),
          h("div", { style: { flex: 0.8, textAlign: "right", fontSize: 12 } }, formatUnits(p.ticker, p.units)),
          h("div", { style: { flex: 0.8, textAlign: "right", fontSize: 12 } }, `€${fmt(p.avgPrice)}`),
          h("div", { style: { flex: 0.8, textAlign: "right", fontSize: 12, fontWeight: 500 } }, `€${fmt(p.currentPrice)}`),
          h("div", { style: { flex: 0.8, textAlign: "right", fontSize: 13, fontWeight: 500 } }, `€${fmtEur(p.currentValue)}`),
          h("div", { style: { flex: 0.7, textAlign: "right", fontSize: 13, fontWeight: 500, color: isPositive ? "#30D158" : "#FF375F" } },
            `${isPositive ? "+" : "-"}€${fmtEur(plAmountAbs)}`
          ),
          h("div", { style: { flex: 0.7, textAlign: "right", fontSize: 13, fontWeight: 600, color: isPositive ? "#30D158" : "#FF375F" } },
            pct(p.plPct)
          )
        );
      }

      // Mobile layout
      return h("div", { 
        key: p.ticker, 
        style: { 
          padding: "14px 16px",
          borderBottom: !isLast ? "0.5px solid #2C2C2E" : "none"
        } 
      },
        h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" } },
          h("div", { style: { display: "flex", alignItems: "flex-start", gap: 12, flex: 1 } },
            h("div", { style: { width: 44, height: 44, borderRadius: 10, background: p.color + "22", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 } },
              h("span", { style: { fontSize: 14, fontWeight: 700, color: p.color } }, p.ticker)
            ),
            h("div", { style: { flex: 1 } },
              h("div", { style: { fontSize: 16, fontWeight: 600, marginBottom: 4 } }, getDisplayName(p.ticker)),
              h("div", { style: { fontSize: 12, color: "#fff" } },
                `${formatUnits(p.ticker, p.units)}  |  €${fmt(p.currentPrice)}`
              )
            )
          ),
          h("div", { style: { textAlign: "right", flexShrink: 0 } },
            h("div", { style: { fontSize: 18, fontWeight: 700, color: "#fff" } }, `€${fmtEur(p.currentValue)}`),
            h("div", { style: { fontSize: 13, fontWeight: 600, color: isPositive ? "#30D158" : "#FF375F" } },
              `${isPositive ? "+" : "-"}€${fmtEur(plAmountAbs)} ${pct(p.plPct)}`
            )
          )
        )
      );
    }),

    // Best & Worst Performers section - inside same card
    h("div", { style: { 
      display: "grid", 
      gridTemplateColumns: "1fr 1fr", 
      gap: 12, 
      padding: "16px",
      borderTop: "1px solid #2C2C2E",
      marginTop: 4
    } },
      // Best performer card
      h("div", { style: { 
        background: "#2C2C2E", 
        borderRadius: 12, 
        padding: 14,
        width: "100%",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      } },
        h("div", { style: { fontSize: 12, color: "#636366", marginBottom: 4, textAlign: "center" } }, "Best Performer"),
        h("div", { style: { fontSize: 16, fontWeight: 600, textAlign: "center" } }, getDisplayName(bestPerformer?.ticker || "-")),
        h("div", { style: { display: "flex", alignItems: "baseline", gap: 8, marginTop: 6, flexWrap: "wrap", justifyContent: "center" } },
          h("span", { style: { fontSize: 20, fontWeight: 700, color: "#30D158" } }, 
            bestPerformer ? `${bestPerformer.pl >= 0 ? "+" : "-"}€${fmtEur(Math.abs(bestPerformer.pl))}` : "-"
          ),
          h("span", { style: { fontSize: 16, fontWeight: 600, color: bestPerformer?.plPct >= 0 ? "#30D158" : "#FF375F" } }, 
            bestPerformer ? `(${pct(bestPerformer.plPct)})` : "-"
          )
        )
      ),
      // Worst performer card
      h("div", { style: { 
        background: "#2C2C2E", 
        borderRadius: 12, 
        padding: 14,
        width: "100%",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      } },
        h("div", { style: { fontSize: 12, color: "#636366", marginBottom: 4, textAlign: "center" } }, "Worst Performer"),
        h("div", { style: { fontSize: 16, fontWeight: 600, textAlign: "center" } }, getDisplayName(worstPerformer?.ticker || "-")),
        h("div", { style: { display: "flex", alignItems: "baseline", gap: 8, marginTop: 6, flexWrap: "wrap", justifyContent: "center" } },
          h("span", { style: { fontSize: 20, fontWeight: 700, color: "#FF375F" } }, 
            worstPerformer ? `${worstPerformer.pl >= 0 ? "+" : "-"}€${fmtEur(Math.abs(worstPerformer.pl))}` : "-"
          ),
          h("span", { style: { fontSize: 16, fontWeight: 600, color: worstPerformer?.plPct >= 0 ? "#30D158" : "#FF375F" } }, 
            worstPerformer ? `(${pct(worstPerformer.plPct)})` : "-"
          )
        )
      )
    )
  );
}