import { fmt, pct, formatNumber } from '../utils.js';

const { createElement: h } = React;

export function MetricCards({ totalValue, totalPL, totalPLPct, hasLivePrices }) {
  const isPositive = totalPL >= 0;

  return h("div", {
    style: {
      padding: "0 16px 16px"
    }
  },
    h("div", {
      style: {
        background: "#1C1C1E",
        borderRadius: 16,
        padding: "20px 16px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        position: "relative"
      }
    },
      // Live prices indicator in top-left corner
      hasLivePrices && h("div", { 
        style: { 
          position: "absolute", 
          top: 12, 
          left: 16, 
          fontSize: 10, 
          color: "#30D158",
          display: "flex",
          alignItems: "center",
          gap: 4
        } 
      }, 
        h("span", { style: { fontSize: 8, color: "#30D158" } }, "●"),
        "Live prices"
      ),
      
      h("div", { style: { fontSize: 12, color: "#636366", marginBottom: 4 } }, "Total Worth"),
      h("div", { style: { fontSize: 36, fontWeight: 700, color: "#fff", letterSpacing: -0.5 } }, 
        `${formatNumber(totalValue)} €`
      ),
      
      h("div", { 
        style: { 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center", 
          gap: 12, 
          marginTop: 12 
        } 
      },
        h("span", { 
          style: { 
            fontSize: 18, 
            fontWeight: 700, 
            color: isPositive ? "#30D158" : "#FF375F"
          } 
        }, 
          `${totalPL >= 0 ? "+" : "-"}${formatNumber(Math.abs(totalPL))} €`
        ),
        h("span", { 
          style: { 
            background: isPositive ? "rgba(48, 209, 88, 0.15)" : "rgba(255, 55, 95, 0.15)",
            borderRadius: 8,
            padding: "4px 10px",
            fontSize: 14,
            fontWeight: 600,
            color: isPositive ? "#30D158" : "#FF375F"
          } 
        }, 
          pct(totalPLPct)
        )
      )
    )
  );
}