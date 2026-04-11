import { fmt, fmtEur, formatNumber } from '../utils.js';
import { UNDERLYING_URL } from '../config.js';
import { getTickerColor, getSectorColor, getLocationColor } from '../config.js';

// Al principio del archivo, después de los imports
const countryAbbreviations = {
  "United States": "USA",
  "United Kingdom": "UK"
};

const abbreviateCountry = (country, isMobile) => {
  if (!isMobile) return country;
  return countryAbbreviations[country] || country;
};


const { createElement: h, useState, useEffect, useCallback } = React;

export function UnderlyingTab({ cardStyle, emptyCard }) {
  const [underlying, setUnderlying] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalValue, setTotalValue] = useState(0);
  const [lastUpdate, setLastUpdate] = useState(null);
  
  // Ordenamiento
  const [sortField, setSortField] = useState('value');
  const [sortDirection, setSortDirection] = useState('desc');
  const [sortedData, setSortedData] = useState([]);
  
  // Efectos visuales
  const [headerPulse, setHeaderPulse] = useState(false);
  const [isSorting, setIsSorting] = useState(false);
  
  // Filtro (mostrar solo > 0.25%)
  const MIN_PERCENTAGE = 0.25;
  const [filterMin, setFilterMin] = useState(true);
  const [filteredData, setFilteredData] = useState([]);
  const [hiddenCount, setHiddenCount] = useState(0);

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

  // Aplicar filtro y ordenamiento
  useEffect(() => {
    if (underlying.length === 0) return;
    
    // Filtrar por porcentaje mínimo
    let filtered = underlying;
    if (filterMin) {
      filtered = underlying.filter(item => item.pct >= MIN_PERCENTAGE);
      setHiddenCount(underlying.length - filtered.length);
    } else {
      setHiddenCount(0);
    }
    
    // Ordenar
    const sorted = [...filtered].sort((a, b) => {
      let aVal, bVal;
      
      switch (sortField) {
        case 'name':
          aVal = a.name?.toLowerCase() || '';
          bVal = b.name?.toLowerCase() || '';
          break;
        case 'sector':
          aVal = a.sector?.toLowerCase() || '';
          bVal = b.sector?.toLowerCase() || '';
          break;
        case 'location':
          aVal = a.location?.toLowerCase() || '';
          bVal = b.location?.toLowerCase() || '';
          break;
        case 'value':
          aVal = a.value || 0;
          bVal = b.value || 0;
          break;
        case 'pct':
          aVal = a.pct || 0;
          bVal = b.pct || 0;
          break;
        default:
          aVal = a.value || 0;
          bVal = b.value || 0;
      }
      
      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      } else {
        return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
      }
    });
    
    setSortedData(sorted);
  }, [underlying, sortField, sortDirection, filterMin]);

  const handleSort = (field) => {
    // Activar efectos visuales
    setHeaderPulse(true);
    setIsSorting(true);
    
    // Cambiar orden
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection(field === 'name' || field === 'sector' || field === 'location' ? 'asc' : 'desc');
    }
    
    // Desactivar efectos después de la animación
    setTimeout(() => setHeaderPulse(false), 200);
    setTimeout(() => setIsSorting(false), 300);
  };

  const toggleFilter = () => {
    setFilterMin(!filterMin);
  };

  const getSortIndicator = (field) => {
    if (sortField !== field) return '';
    return h("span", { 
      style: { 
        display: 'inline-block',
        transition: 'transform 0.2s ease',
        transform: sortDirection === 'asc' ? 'rotate(0deg)' : 'rotate(180deg)',
        marginLeft: 4,
        fontSize: 10
      } 
    }, "▲");
  };

  const sortableHeaderStyle = (field) => ({
    cursor: 'pointer',
    userSelect: 'none',
    transition: 'color 0.15s ease',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 2,
    color: sortField === field ? '#fff' : '#636366'
  });

  if (loading) {
    return emptyCard("Loading underlying portfolio...");
  }

  if (underlying.length === 0) {
    return emptyCard("No underlying data available. Run fetch_prices.py to generate.");
  }

  const displayHoldings = sortedData.slice(0, 100);
  const isMobile = window.innerWidth < 640;

  const truncate = (text, maxLength) => {
    if (!text) return "—";
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - 3) + "...";
  };

  return h("div", { style: { ...cardStyle, padding: "4px 16px" } },
    // Header with timestamp and filter info
    h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "12px 0", borderBottom: "1px solid #2C2C2E", marginBottom: 8, flexWrap: "wrap", gap: 8 } },
      h("div", { style: { display: "flex", alignItems: "baseline", gap: 12 } },
        h("div", { style: { fontSize: 16, fontWeight: 600, color: "#fff" } }, "Real Portfolio Breakdown"),
        h("div", { 
          style: { 
            fontSize: 11, 
            color: filterMin ? "#30D158" : "#636366",
            cursor: "pointer",
            padding: "2px 8px",
            borderRadius: 12,
            background: filterMin ? "rgba(48, 209, 88, 0.15)" : "#2C2C2E",
            transition: "all 0.2s ease"
          },
          onClick: toggleFilter,
          title: filterMin ? "Click to show all holdings" : "Click to hide holdings below 0.25%"
        },
          filterMin ? `✓ Showing >${MIN_PERCENTAGE}% (${sortedData.length} of ${underlying.length})` : `Showing all (${underlying.length})`
        )
      ),
      lastUpdate && h("div", { style: { fontSize: 10, color: "#636366", fontFamily: "monospace" } }, 
        `Updated: ${new Date(lastUpdate).toLocaleDateString("es-ES", { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric' 
        })}`
      )
    ),
    
    // Desktop layout - sortable headers with pulse effect
    !isMobile && h("div", { 
      style: { 
        display: "flex", 
        padding: "8px 0", 
        borderBottom: "1px solid #2C2C2E", 
        fontSize: 12, 
        fontWeight: 600,
        transition: 'background 0.15s ease',
        background: headerPulse ? '#2C2C2E' : 'transparent'
      } 
    },
      h("div", { style: { flex: 2.5 } },
        h("span", { 
          style: sortableHeaderStyle('name'), 
          onClick: () => handleSort('name') 
        }, 
          "Company", getSortIndicator('name')
        )
      ),
      h("div", { style: { flex: 1, textAlign: "left" } },
        h("span", { 
          style: sortableHeaderStyle('sector'), 
          onClick: () => handleSort('sector') 
        }, 
          "Sector", getSortIndicator('sector')
        )
      ),
      h("div", { style: { flex: 1, textAlign: "left" } },
        h("span", { 
          style: sortableHeaderStyle('location'), 
          onClick: () => handleSort('location') 
        }, 
          "Location", getSortIndicator('location')
        )
      ),
      h("div", { style: { flex: 1, textAlign: "right" } },
        h("span", { 
          style: sortableHeaderStyle('value'), 
          onClick: () => handleSort('value') 
        }, 
          "Value (€)", getSortIndicator('value')
        )
      ),
      h("div", { style: { flex: 0.8, textAlign: "right" } },
        h("span", { 
          style: sortableHeaderStyle('pct'), 
          onClick: () => handleSort('pct') 
        }, 
          "% Portfolio", getSortIndicator('pct')
        )
      )
    ),
    
    // Data rows with sorting animation
    h("div", { 
      style: { 
        transition: 'opacity 0.2s ease',
        opacity: isSorting ? 0.7 : 1
      } 
    },
      displayHoldings.map((item, i) => {
        const sector = item.sector || "—";
        const location = item.location || "—";
        const sectorColor = getSectorColor(sector);
        const locationColor = getLocationColor(location);
        const tickerColor = getTickerColor(item.ticker, sector);
        const isLast = i === displayHoldings.length - 1;
        
        const truncatedName = truncate(item.name, isMobile ? 35 : 50);
        const truncatedSector = isMobile ? truncate(sector, 35) : sector;
        const truncatedLocation = isMobile ? truncate(location, 15) : location;
        
        // Desktop layout
        if (!isMobile) {
          return h("div", { 
            key: item.ticker, 
            style: { 
              display: "flex", 
              alignItems: "center",
              padding: "10px 0",
              borderBottom: !isLast ? "0.5px solid #2C2C2E" : "none",
              transition: "background 0.15s ease"
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
        
        // Mobile layout
        return h("div", { 
          key: item.ticker, 
          style: { 
            padding: "14px 0",
            borderBottom: !isLast ? "0.5px solid #2C2C2E" : "none"
          } 
        },
          h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" } },
            h("div", { style: { display: "flex", alignItems: "flex-start", gap: 12, flex: 1, minWidth: 0 } },
              h("div", { style: { width: 40, height: 40, borderRadius: 10, background: tickerColor + "22", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 } },
                h("span", { style: { fontSize: 14, fontWeight: 700, color: tickerColor } }, item.ticker.slice(0, 4))
              ),
              h("div", { style: { flex: 1, minWidth: 0 } },
                h("div", { style: { fontSize: 16, fontWeight: 600, color: "#fff", marginBottom: 6, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", title: item.name } }, 
                  truncatedName
                ),
                h("div", { style: { display: "flex", gap: 12, flexWrap: "wrap" } },
                  h("div", { style: { display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#8e8e93" } },
                    h("div", { style: { width: 5, height: 5, borderRadius: 1.5, background: sectorColor } }),
                    h("span", { title: sector }, truncatedSector)
                  ),
                  h("div", { style: { display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#8e8e93" } },
                    h("div", { style: { width: 5, height: 5, borderRadius: 1.5, background: locationColor } }),
                    h("span", { title: location }, abbreviateCountry(truncatedLocation, true))
                  )
                )
              )
            ),
            h("div", { style: { textAlign: "right", flexShrink: 0 } },
              h("div", { style: { fontSize: 20, fontWeight: 700, color: "#fff" } }, `${item.pct.toFixed(1)}%`),
              h("div", { style: { fontSize: 11, color: "#636366", marginTop: 2 } }, `${formatNumber(item.value)} €`)
            )
          )
        );
      })
    ),
    
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