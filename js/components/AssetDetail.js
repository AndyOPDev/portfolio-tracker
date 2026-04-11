import { getDisplayName, formatNumber, toTitleCase } from '../utils.js';
import { getTickerColor, getSectorColor, getLocationColor } from '../config.js';

const { createElement: h, useState, useEffect, useCallback } = React;


// Helper para truncar texto
const truncate = (text, maxLength) => {
  if (!text) return "—";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
};

export function AssetDetail({ asset, onBack, cardStyle }) {
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [sortField, setSortField] = useState('weight');
  const [sortDirection, setSortDirection] = useState('desc');
  const [csvDate, setCsvDate] = useState(null);
  
  // Cargar el CSV correspondiente
  useEffect(() => {
    const loadHoldings = async () => {
      setLoading(true);
      try {
        let url;
        if (asset.ticker === 'XNAS') {
          url = './data/holdings/XNAS_holdings.csv';
        } else if (asset.ticker === 'VVSM') {
          url = './data/holdings/VVSM_holdings.csv';
        } else if (asset.ticker === 'EMRG') {
          url = './data/holdings/EMRG_holdings.csv';
        } else {
          setHoldings([]);
          setLoading(false);
          return;
        }
        
        const response = await fetch(url);
        const text = await response.text();
        
        // Intentar obtener fecha del CSV (si existe en comentarios)
        const dateMatch = text.match(/Fund Holdings as of,?"?(\d{1,2}\/\d{1,2}\/\d{4})/);
        if (dateMatch) {
          const [day, month, year] = dateMatch[1].split('/');
          setCsvDate(new Date(year, month - 1, day));
        }
        
        // Parsear CSV
        const lines = text.trim().split('\n');
        const headers = lines[0].split(',');
        
        // Identificar columnas
        const nameIdx = headers.findIndex(h => h.includes('name') || h.includes('Name'));
        const sectorIdx = headers.findIndex(h => h.includes('sector') || h.includes('Sector'));
        const locationIdx = headers.findIndex(h => h.includes('location') || h.includes('Location') || h.includes('country'));
        const weightIdx = headers.findIndex(h => h.includes('weight') || h.includes('Weight'));
        
        const data = [];
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',');
          if (values.length < 2) continue;
          
          data.push({
            name: nameIdx !== -1 ? values[nameIdx]?.replace(/"/g, '') : '',
            sector: sectorIdx !== -1 ? values[sectorIdx]?.replace(/"/g, '') : '—',
            location: locationIdx !== -1 ? values[locationIdx]?.replace(/"/g, '') : '—',
            weight: weightIdx !== -1 ? parseFloat(values[weightIdx]?.replace(/"/g, '')) || 0 : 0
          });
        }
        
        // Filtrar pesos muy pequeños y ordenar por peso
        const filtered = data.filter(item => item.weight >= 0.05).sort((a, b) => b.weight - a.weight);
        setHoldings(filtered);
      } catch (error) {
        console.error(`Error loading holdings for ${asset.ticker}:`, error);
        setHoldings([]);
      }
      setLoading(false);
    };
    
    loadHoldings();
  }, [asset.ticker]);
  
  // Ordenar datos
  const getSortedData = useCallback(() => {
    const sorted = [...holdings].sort((a, b) => {
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
        case 'weight':
          aVal = a.weight || 0;
          bVal = b.weight || 0;
          break;
        default:
          aVal = a.weight || 0;
          bVal = b.weight || 0;
      }
      
      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      } else {
        return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
      }
    });
    
    return showAll ? sorted : sorted.slice(0, 100);
  }, [holdings, sortField, sortDirection, showAll]);
  
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection(field === 'weight' ? 'desc' : 'asc');
    }
  };
  
  const getSortIndicator = (field) => {
    if (sortField !== field) return '';
    return sortDirection === 'asc' ? ' ▲' : ' ▼';
  };
  
  const sortableHeaderStyle = {
    cursor: 'pointer',
    userSelect: 'none',
    transition: 'opacity 0.15s ease',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 2,
    color: '#636366'
  };
  
  const isMobile = window.innerWidth < 768;
  const displayedData = getSortedData();
  const totalHoldings = holdings.length;
  const hiddenCount = totalHoldings - 100;
  
  // Formatear fecha
  const formattedDate = csvDate ? csvDate.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : null;
  
  // Pantalla de Bitcoin
  if (asset.ticker === 'BTC') {
    return h("div", { style: { ...cardStyle, padding: "4px 16px" } },
      h("div", { style: { display: "flex", alignItems: "center", gap: 16, padding: "12px 0", borderBottom: "1px solid #2C2C2E", marginBottom: 16 } },
        h("button", {
          onClick: onBack,
          style: { background: "#2C2C2E", border: "none", borderRadius: 8, padding: "8px 16px", color: "#fff", cursor: "pointer", fontSize: 13 }
        }, "← Volver"),
        h("div", { style: { fontSize: 20, fontWeight: 600, color: "#fff" } }, getDisplayName(asset.ticker))
      ),
      
      h("div", { style: { background: "#1C1C1E", borderRadius: 16, padding: 20, marginBottom: 16, textAlign: "center" } },
        h("div", { style: { fontSize: 13, color: "#636366", marginBottom: 8 } }, "Precio actual"),
        h("div", { style: { fontSize: 42, fontWeight: 700, color: "#FF9F0A", marginBottom: 8 } }, `€${formatNumber(asset.currentValue / asset.units)}`),
        h("div", { style: { fontSize: 14, color: asset.pl >= 0 ? "#30D158" : "#FF375F" } },
          `${asset.pl >= 0 ? "+" : "-"}€${formatNumber(Math.abs(asset.pl))} (${asset.plPct.toFixed(2)}%)`
        )
      ),
      
      h("div", { style: { background: "#1C1C1E", borderRadius: 16, padding: 16, marginBottom: 16 } },
        h("div", { style: { fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: 12 } }, "Información"),
        h("div", { style: { display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "0.5px solid #2C2C2E" } },
          h("span", { style: { color: "#636366" } }, "Unidades"),
          h("span", { style: { color: "#fff" } }, asset.units.toFixed(6))
        ),
        h("div", { style: { display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "0.5px solid #2C2C2E" } },
          h("span", { style: { color: "#636366" } }, "Invertido"),
          h("span", { style: { color: "#fff" } }, `€${formatNumber(asset.totalInvested)}`)
        ),
        h("div", { style: { display: "flex", justifyContent: "space-between", padding: "8px 0" } },
          h("span", { style: { color: "#636366" } }, "Valor actual"),
          h("span", { style: { color: "#fff" } }, `€${formatNumber(asset.currentValue)}`)
        )
      ),
      
      h("div", { style: { background: "#1C1C1E", borderRadius: 16, padding: 16 } },
        h("div", { style: { fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: 12 } }, "Enlaces de interés"),
        h("a", { href: "https://www.coingecko.com/es/coins/bitcoin", target: "_blank", style: { color: "#0A84FF", textDecoration: "none", display: "block", marginBottom: 8 } }, "CoinGecko →"),
        h("a", { href: "https://www.kraken.com/prices/bitcoin", target: "_blank", style: { color: "#0A84FF", textDecoration: "none", display: "block" } }, "Kraken →")
      )
    );
  }
  
  // Pantalla de carga
  if (loading) {
    return h("div", { style: { ...cardStyle, padding: "4px 16px" } },
      h("div", { style: { display: "flex", alignItems: "center", gap: 16, padding: "12px 0", borderBottom: "1px solid #2C2C2E", marginBottom: 16 } },
        h("button", { onClick: onBack, style: { background: "#2C2C2E", border: "none", borderRadius: 8, padding: "8px 16px", color: "#fff", cursor: "pointer", fontSize: 13 } }, "← Volver"),
        h("div", { style: { fontSize: 20, fontWeight: 600, color: "#fff" } }, getDisplayName(asset.ticker))
      ),
      h("div", { style: { textAlign: "center", padding: 40, color: "#636366" } }, "Cargando...")
    );
  }
  
  // Pantalla de holdings
  return h("div", { style: { ...cardStyle, padding: "4px 16px" } },
    // Header
    h("div", { style: { display: "flex", alignItems: "center", gap: 16, padding: "12px 0", borderBottom: "1px solid #2C2C2E", marginBottom: 16, flexWrap: "wrap" } },
      h("button", {
        onClick: onBack,
        style: { background: "#2C2C2E", border: "none", borderRadius: 8, padding: "8px 16px", color: "#fff", cursor: "pointer", fontSize: 13 }
      }, "← Volver"),
      h("div", { style: { fontSize: 20, fontWeight: 600, color: "#fff" } }, getDisplayName(asset.ticker)),
      formattedDate && h("div", { style: { fontSize: 10, color: "#636366", fontFamily: "monospace", marginLeft: "auto" } }, 
        `Holdings: ${formattedDate}`
      )
    ),
    
    // Tabla de holdings - Desktop
    !isMobile && h("div", { style: { display: "flex", padding: "8px 0", borderBottom: "1px solid #2C2C2E", fontSize: 12, fontWeight: 600, color: "#636366" } },
      h("div", { style: { flex: 2.5 } },
        h("span", { style: sortableHeaderStyle, onClick: () => handleSort('name') }, "Company", getSortIndicator('name'))
      ),
      h("div", { style: { flex: 1.2, textAlign: "left" } },
        h("span", { style: sortableHeaderStyle, onClick: () => handleSort('sector') }, "Sector", getSortIndicator('sector'))
      ),
      h("div", { style: { flex: 1.2, textAlign: "left" } },
        h("span", { style: sortableHeaderStyle, onClick: () => handleSort('location') }, "Location", getSortIndicator('location'))
      ),
      h("div", { style: { flex: 0.8, textAlign: "right" } },
        h("span", { style: sortableHeaderStyle, onClick: () => handleSort('weight') }, "Weight (%)", getSortIndicator('weight'))
      )
    ),
    
    // Filas de datos
    h("div", null,
      displayedData.map((item, i) => {
        const sectorColor = getSectorColor(item.sector);
        const locationColor = getLocationColor(item.location);
        const truncatedName = truncate(toTitleCase(item.name), isMobile ? 35 : 60);
        const truncatedSector = truncate(item.sector, isMobile ? 35 : 60);
        const truncatedLocation = truncate(item.location, isMobile ? 35 : 60);
        const isLast = i === displayedData.length - 1;
        
        // Desktop layout
        if (!isMobile) {
          return h("div", { key: i, style: { display: "flex", alignItems: "center", padding: "10px 0", borderBottom: !isLast ? "0.5px solid #2C2C2E" : "none" } },
            h("div", { style: { flex: 2.5, minWidth: 0 } },
              h("div", { style: { fontSize: 13, fontWeight: 500, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", title: item.name } }, truncatedName)
            ),
            h("div", { style: { flex: 1.2, display: "flex", alignItems: "center", gap: 6, minWidth: 0 } },
              h("div", { style: { width: 6, height: 6, borderRadius: 1.5, background: sectorColor, flexShrink: 0 } }),
              h("span", { style: { fontSize: 12, color: "#8e8e93", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", title: item.sector } }, truncatedSector)
            ),
            h("div", { style: { flex: 1.2, display: "flex", alignItems: "center", gap: 6, minWidth: 0 } },
              h("div", { style: { width: 6, height: 6, borderRadius: 1.5, background: locationColor, flexShrink: 0 } }),
              h("span", { style: { fontSize: 12, color: "#8e8e93", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", title: item.location } }, truncatedLocation)
            ),
            h("div", { style: { flex: 0.8, textAlign: "right", fontSize: 13, fontWeight: 500, color: "#fff" } }, `${item.weight.toFixed(2)}%`)
          );
        }
        
        // Mobile layout - todo en línea con ancho fijo para location
        return h("div", { key: i, style: { padding: "12px 0", borderBottom: !isLast ? "0.5px solid #2C2C2E" : "none" } },
          h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 } },
            h("div", { style: { fontSize: 14, fontWeight: 600, color: "#fff", flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", title: item.name } }, truncatedName),
            h("div", { style: { fontSize: 13, fontWeight: 500, color: "#fff", marginLeft: 8, flexShrink: 0 } }, `${item.weight.toFixed(2)}%`)
          ),
          h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" } },
            h("div", { style: { display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#8e8e93", flex: 1 } },
              h("div", { style: { width: 8, height: 8, borderRadius: 2, background: sectorColor, flexShrink: 0 } }),
              h("span", { style: { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", title: item.sector } }, truncatedSector)
            ),
            h("div", { style: { display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#8e8e93", flex: 1, justifyContent: "flex-end" } },
              h("div", { style: { width: 8, height: 8, borderRadius: 2, background: locationColor, flexShrink: 0 } }),
              h("span", { style: { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", textAlign: "right", title: item.location } }, truncatedLocation)
            )
          )
        );
      })
    ),
    
    // Botón "Mostrar más"
    totalHoldings > 100 && h("div", { style: { padding: "16px 0", textAlign: "center", borderTop: "1px solid #2C2C2E", marginTop: 8 } },
      h("button", {
        onClick: () => setShowAll(!showAll),
        style: { background: "#2C2C2E", border: "none", borderRadius: 8, padding: "8px 20px", color: "#fff", cursor: "pointer", fontSize: 13 }
      }, showAll ? `Mostrar menos (solo 100 de ${totalHoldings})` : `Mostrar ${hiddenCount} más...`)
    ),
    
    // Total de holdings
    h("div", { style: { display: "flex", padding: "12px 0", marginTop: 4, borderTop: "1px solid #2C2C2E", fontSize: 12, color: "#636366" } },
      h("div", { style: { flex: 1 } }, `Total holdings: ${totalHoldings}`),
      h("div", { style: { textAlign: "right" } }, `Mostrando: ${displayedData.length}`)
    )
  );
}