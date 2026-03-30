import { fmt, fmtEur, formatNumber } from '../utils.js';
import { UNDERLYING_URL } from '../config.js';
import { getTickerColor, getSectorColor, getLocationColor } from '../config.js';

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

  const displayHoldings = underlying.slice(0, 100);
  const isMobile = window.innerWidth < 640;

  // Helper for truncated text
  const truncate = (text, maxLength) => {
    if (!text) return "—";
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - 3) + "...";
  };

  return h("div", { style: { ...cardStyle, padding: "4px 16px" } },
    // Header with timestamp
    h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "12px 0", borderBottom: "1px solid #2C2C2E", marginBottom: 8 } },
      h("div", { style: { fontSize: 16, fontWeight: 600, color: "#fff" } }, "Real Portfolio Breakdown"),
      lastUpdate && h("div", { style: { fontSize: 10, color: "#636366", fontFamily: "monospace" } }, 
        `Updated: ${new Date(lastUpdate).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`
      )
    ),
    
    // Desktop layout
    !isMobile && h("div", { style: { display: "flex", padding: "8px 0", borderBottom: "1px solid #2C2C2E", fontSize: 12, fontWeight: 600, color: "#636366" } },
      h("div", { style: { flex: 2.5 } }, "Company"),
      h("div", { style: { flex: 1, textAlign: "left" } }, "Sector"),
      h("div", { style: { flex: 1, textAlign: "left" } }, "Location"),
      h("div", { style: { flex: 1, textAlign: "right" } }, "Value"),
      h("div", { style: { flex: 0.8, textAlign: "right" } }, "% Portfolio")
    ),
    
    // Data rows
    displayHoldings.map((item, i) => {
      const sector = item.sector || "—";
      const location = item.location || "—";
      const sectorColor = getSectorColor(sector);
      const locationColor = getLocationColor(location);
      
      const tickerColor = getTickerColor(item.ticker, sector);
      const isLast = i === displayHoldings.length - 1;
      
      const truncatedName = truncate(item.name, isMobile ? 25 : 50);
      const truncatedSector = isMobile ? truncate(sector, 12) : sector;
      const truncatedLocation = isMobile ? truncate(location, 12) : location;
      
      // Desktop layout
      if (!isMobile) {
        return h("div", { 
          key: item.ticker, 
          style: { 
            display: "flex", 
            alignItems: "center",
            padding: "10px 0",
            borderBottom: !isLast ? "0.5px solid #2C2C2E" : "none"
          } 
        },
          h("div", { style: { flex: 2.5, display: "flex", alignItems: "center", gap: 10, minWidth: 0 } },
            h("div", { style: { width: 32, height: 32, borderRadius: 8, background: tickerColor + "22", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 } },
              h("span", { style: { fontSize: 12, fontWeight: 700, color: tickerColor } }, item.ticker.slice(0, 4))
            ),
            h("div", { style: { minWidth: 0, flex: 1 } },
              h("div", { style: { fontSize: 14, fontWeight: 600, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", title: item.name } }, 
                truncatedName
              )
            )
          ),
          h("div", { style: { flex: 1, display: "flex", alignItems: "center", gap: 6, minWidth: 0 } },
            h("div", { style: { width: 6, height: 6, borderRadius: 1.5, background: sectorColor, flexShrink: 0 } }),
            h("span", { style: { fontSize: 11, color: "#8e8e93", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", title: sector } }, 
              truncatedSector
            )
          ),
          h("div", { style: { flex: 1, display: "flex", alignItems: "center", gap: 6, minWidth: 0 } },
            h("div", { style: { width: 6, height: 6, borderRadius: 1.5, background: locationColor, flexShrink: 0 } }),
            h("span", { style: { fontSize: 11, color: "#8e8e93", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", title: location } }, 
              truncatedLocation
            )
          ),
          h("div", { style: { flex: 1, textAlign: "right", fontSize: 13, fontWeight: 500, color: "#fff" } }, `${formatNumber(item.value)} €`),
          h("div", { style: { flex: 0.8, textAlign: "right" } },
            h("span", { style: { background: "#2C2C2E", padding: "2px 8px", borderRadius: 12, fontSize: 11, color: "#fff" } }, item.pct.toFixed(2) + "%")
          )
        );
      }
      
      // Mobile layout - sector and location on same line
      return h("div", { 
        key: item.ticker, 
        style: { 
          padding: "14px 0",
          borderBottom: !isLast ? "0.5px solid #2C2C2E" : "none"
        } 
      },
        h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" } },
          // Left side: badge + name
          h("div", { style: { display: "flex", alignItems: "flex-start", gap: 12, flex: 1, minWidth: 0 } },
            h("div", { style: { width: 40, height: 40, borderRadius: 10, background: tickerColor + "22", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 } },
              h("span", { style: { fontSize: 14, fontWeight: 700, color: tickerColor } }, item.ticker.slice(0, 4))
            ),
            h("div", { style: { flex: 1, minWidth: 0 } },
              h("div", { style: { fontSize: 16, fontWeight: 600, color: "#fff", marginBottom: 6, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", title: item.name } }, 
                truncatedName
              ),
              // Sector and location on same row
              h("div", { style: { display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" } },
                h("div", { style: { display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#8e8e93" } },
                  h("div", { style: { width: 6, height: 6, borderRadius: 1.5, background: sectorColor } }),
                  h("span", { title: sector }, truncatedSector)
                ),
                h("div", { style: { display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#8e8e93" } },
                  h("div", { style: { width: 6, height: 6, borderRadius: 1.5, background: locationColor } }),
                  h("span", { title: location }, truncatedLocation)
                )
              )
            )
          ),
          // Right side: percentage and value
          h("div", { style: { textAlign: "right", flexShrink: 0 } },
            h("div", { style: { fontSize: 20, fontWeight: 700, color: "#fff" } }, `${item.pct.toFixed(1)}%`),
            h("div", { style: { fontSize: 11, color: "#636366", marginTop: 2 } }, `${formatNumber(item.value)} €`)
          )
        )
      );
    }),
    
    // Total row
    h("div", { style: { display: "flex", padding: "12px 0", marginTop: 4, borderTop: "1px solid #2C2C2E", fontSize: 13, fontWeight: 600 } },
      h("div", { style: { flex: 2.5 } }, "TOTAL"),
      !isMobile && h("div", { style: { flex: 1 } }, ""),
      !isMobile && h("div", { style: { flex: 1 } }, ""),
      h("div", { style: { flex: 1, textAlign: "right", fontSize: 14, fontWeight: 700, color: "#fff" } }, `${formatNumber(totalValue)} €`),
      h("div", { style: { flex: 0.8, textAlign: "right", fontSize: 14, fontWeight: 700, color: "#fff" } }, "100%")
    )
  );
}