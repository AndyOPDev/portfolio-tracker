import { fmt } from '../utils.js';

const { createElement: h, useState, useEffect } = React;

export function UnderlyingTab({ cardStyle, emptyCard }) {
  const [underlying, setUnderlying] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalValue, setTotalValue] = useState(0);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    fetchUnderlying();
  }, []);

  const fetchUnderlying = async () => {
    setLoading(true);
    try {
      const response = await fetch('/data/underlying.json');
      if (response.ok) {
        const data = await response.json();
        setUnderlying(data.underlying || []);
        setTotalValue(data.total_value || 0);
        setLastUpdate(data.updated);
      }
    } catch (error) {
      console.error("Error fetching underlying:", error);
    }
    setLoading(false);
  };

  if (loading) {
    return emptyCard("Loading underlying portfolio...");
  }

  if (underlying.length === 0) {
    return emptyCard("No underlying data available. Run fetch_prices.py to generate.");
  }

  // Show top 50 holdings (or all if less)
  const displayHoldings = underlying.slice(0, 50);

  return h("div", { style: cardStyle },
    h("div", { style: { padding: "12px 0", borderBottom: "1px solid #2C2C2E", marginBottom: 8 } },
      h("div", { style: { fontSize: 14, fontWeight: 600, color: "#fff" } }, "Real Portfolio Breakdown"),
      h("div", { style: { fontSize: 11, color: "#636366", marginTop: 4 } }, 
        lastUpdate ? `Updated: ${new Date(lastUpdate).toLocaleString()}` : ""
      )
    ),
    
    // Header row
    h("div", { style: { display: "flex", padding: "8px 0", borderBottom: "1px solid #2C2C2E", fontSize: 12, fontWeight: 600, color: "#636366" } },
      h("div", { style: { flex: 3 } }, "Company"),
      h("div", { style: { flex: 1, textAlign: "right" } }, "Value (€)"),
      h("div", { style: { flex: 1, textAlign: "right" } }, "% Portfolio")
    ),
    
    // Data rows
    displayHoldings.map((item, i) =>
      h("div", { key: item.ticker, style: { display: "flex", padding: "8px 0", borderBottom: i < displayHoldings.length - 1 ? "0.5px solid #2C2C2E" : "none", fontSize: 13 } },
        h("div", { style: { flex: 3 } },
          h("div", { style: { fontWeight: 500 } }, item.name),
          h("div", { style: { fontSize: 10, color: "#636366" } }, item.ticker)
        ),
        h("div", { style: { flex: 1, textAlign: "right", fontWeight: 500 } }, `€${fmt(item.value)}`),
        h("div", { style: { flex: 1, textAlign: "right" } },
          h("span", { style: { background: "#2C2C2E", padding: "2px 8px", borderRadius: 12, fontSize: 11 } },
            item.pct.toFixed(2) + "%"
          )
        )
      )
    ),
    
    // Total row
    h("div", { style: { display: "flex", padding: "12px 0", marginTop: 8, borderTop: "1px solid #2C2C2E", fontSize: 13, fontWeight: 600 } },
      h("div", { style: { flex: 3 } }, "TOTAL"),
      h("div", { style: { flex: 1, textAlign: "right" } }, `€${fmt(totalValue)}`),
      h("div", { style: { flex: 1, textAlign: "right" } }, "100%")
    )
  );
}