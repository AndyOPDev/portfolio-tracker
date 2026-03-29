import { fmt, fmtEur } from '../utils.js';
import { UNDERLYING_URL } from '../config.js';
import { getTickerColor } from '../config.js';
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
      const response = await fetch(UNDERLYING_URL);
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

  // Top 50 holdings
  const displayHoldings = underlying.slice(0, 50);
  const isMobile = window.innerWidth < 640;

  return h("div", { style: cardStyle },
    // Header
    h("div", { style: { padding: "12px 0", borderBottom: "1px solid #2C2C2E", marginBottom: 8 } },
      h("div", { style: { fontSize: 14, fontWeight: 600, color: "#fff" } }, "Real Portfolio Breakdown"),
      h("div", { style: { fontSize: 11, color: "#636366", marginTop: 4 } }, 
        lastUpdate ? `Updated: ${new Date(lastUpdate).toLocaleString()}` : ""
      )
    ),
    
    // Table header
    h("div", { style: { display: "flex", padding: "8px 0", borderBottom: "1px solid #2C2C2E", fontSize: 12, fontWeight: 600, color: "#636366" } },
      h("div", { style: { flex: 3 } }, "Company"),
      !isMobile && h("div", { style: { flex: 1.5, textAlign: "left" } }, "Sector / Location"),
      h("div", { style: { flex: 1, textAlign: "right" } }, "Value"),
      h("div", { style: { flex: 0.8, textAlign: "right" } }, "% Port.")
    ),
    
    // Data rows
    displayHoldings.map((item, i) =>
      h("div", { 
        key: item.ticker, 
        style: { 
          display: "flex", 
          alignItems: "center",
          borderBottom: i < displayHoldings.length - 1 ? "0.5px solid #2C2C2E" : "none", 
          fontSize: 13, 
          padding: "10px 0" 
        } 
      },
        // Company with badge
        h("div", { style: { flex: 3, display: "flex", alignItems: "center", gap: 8, minWidth: 0 } },
          h("div", { style: { width: 28, height: 28, borderRadius: 8, background: getTickerColor(item.ticker) + "22", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 } },
            h("span", { style: { fontSize: 11, fontWeight: 700, color: getTickerColor(item.ticker) } }, item.ticker.slice(0, 4))
          ),
          h("div", { style: { minWidth: 0 } },
            h("div", { style: { fontSize: 14, fontWeight: 600 } }, item.name),
            isMobile && h("div", { style: { fontSize: 10, color: "#636366", marginTop: 2 } }, `${item.sector || ""} / ${item.location || ""}`)
          )
        ),
        
        // Sector / Location - only desktop
        !isMobile && h("div", { style: { flex: 1.5, fontSize: 11, color: "#8e8e93" } }, `${item.sector || ""} / ${item.location || ""}`),
        
        // Value
        h("div", { style: { flex: 1, textAlign: "right", fontWeight: 500 } }, `€${fmtEur(item.value)}`),
        
        // % Portfolio
        h("div", { style: { flex: 0.8, textAlign: "right" } },
          h("span", { style: { background: "#2C2C2E", padding: "2px 8px", borderRadius: 12, fontSize: 11 } }, item.pct.toFixed(2) + "%")
        )
      )
    ),
    
    // Total row
    h("div", { style: { display: "flex", padding: "12px 0", marginTop: 8, borderTop: "1px solid #2C2C2E", fontSize: 13, fontWeight: 600 } },
      h("div", { style: { flex: 3 } }, "TOTAL"),
      !isMobile && h("div", { style: { flex: 1.5 } }, ""),
      h("div", { style: { flex: 1, textAlign: "right" } }, `€${fmtEur(totalValue)}`),
      h("div", { style: { flex: 0.8, textAlign: "right" } }, "100%")
    )
  );
}