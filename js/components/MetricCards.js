import { fmt, pct } from '../utils.js';

const { createElement: h } = React;

export function MetricCards({ totalValue, totalPL, totalPLPct, lastGitHubUpdate }) {
  const isPositive = totalPL >= 0;

  // Format timestamp
  const formattedTime = lastGitHubUpdate 
    ? new Date(lastGitHubUpdate).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
    : "";

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
      // Timestamp in top-right corner
      formattedTime && h("div", { 
        style: { 
          position: "absolute", 
          top: 12, 
          right: 16, 
          fontSize: 10, 
          color: "#636366",
          fontFamily: "monospace"
        } 
      }, 
        `Updated ${formattedTime}`
      ),
      
      h("div", { style: { fontSize: 12, color: "#636366", marginBottom: 4 } }, "Total Worth"),
      h("div", { style: { fontSize: 36, fontWeight: 700, color: "#fff", letterSpacing: -0.5 } }, 
        `${fmt(totalValue)} €`
      ),
      
      // P&L row
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
          `${totalPL >= 0 ? "+" : "-"}${fmt(Math.abs(totalPL))}`
        ),
        h("span", { 
          style: { 
            background: isPositive ? "rgba(48, 209, 88, 0.15)" : "rgba(255, 55, 95, 0.15)",
            borderRadius: 6,
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