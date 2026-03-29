// DistributionTab.js
import { getDisplayName, fmt } from '../utils.js';
import { DonutChart } from '../charts.js';
import { getTickerColor, getSectorColor, getLocationColor } from '../config.js';
const { createElement: h } = React;

export function DistributionTab({ enriched, totalValue, cardFlatStyle, emptyCard, underlying }) {
  if (!underlying || underlying.length === 0) {
    return emptyCard("No underlying data available");
  }

  // --- Datos por activo (ETFs + BTC desde enriched positions) ---
  const assetData = enriched
    .filter(p => p.currentValue > 0)
    .map(p => ({
      name: getDisplayName(p.ticker),
      value: parseFloat(((p.currentValue / totalValue) * 100).toFixed(2)),
      ticker: p.ticker,
      color: p.color,
      currentValue: p.currentValue
    }))
    .sort((a, b) => b.value - a.value);

  // --- Datos por sector ---
  const sectorMap = {};
  underlying.forEach(u => {
    const sector = u.sector || "Unknown";
    if (!sectorMap[sector]) sectorMap[sector] = 0;
    sectorMap[sector] += u.value;
  });
  const totalUnderlyingValue = underlying.reduce((s, u) => s + u.value, 0);
  const sectorData = Object.entries(sectorMap)
    .map(([name, value]) => ({
      name,
      value: parseFloat(((value / totalUnderlyingValue) * 100).toFixed(2)),
      color: getSectorColor(name)
    }))
    .sort((a, b) => b.value - a.value);

  // --- Datos por location ---
  const locMap = {};
  underlying.forEach(u => {
    const loc = u.location || "Other";
    if (!locMap[loc]) locMap[loc] = 0;
    locMap[loc] += u.value;
  });
  const locationData = Object.entries(locMap)
    .map(([name, value]) => ({
      name,
      value: parseFloat(((value / totalUnderlyingValue) * 100).toFixed(2)),
      color: getLocationColor(name)
    }))
    .sort((a, b) => b.value - a.value);

  // --- Render barras horizontal normalizadas con umbral relativo ---
  const renderBars = (data) => {
    if (!data || data.length === 0) return null;
    const maxValue = Math.max(...data.map(d => d.value));

    return h("div", { style: { marginBottom: 24 } },
      data.map((item, i) => {
        const widthPercent = (item.value / maxValue) * 100;

        // Si la barra tiene menos del 10% del máximo → borde pequeño
        const isSmall = (item.value / maxValue) < 1.1;
        const borderRadius = isSmall 
          ? { borderRadius: 3 } 
          : { borderRadius: 9999 };

        return h("div", {
          key: item.name + i,
          style: { marginBottom: 16, display: "flex", alignItems: "center", gap: 14 },
          title: `${item.name}\n${fmt(item.value)}%`
        },
          // Label + color
          h("div", { style: { width: 155, flexShrink: 0, display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, fontWeight: 500, color: "#fff" } },
            h("div", { style: { width: 11, height: 11, borderRadius: 3, background: item.color } }),
            item.name
          ),
          // Barra proporcional
          h("div", { style: { flex: 1, height: 26, overflow: "hidden", background: "transparent", position: "relative" } },
            h("div", { 
              style: { 
                width: `${widthPercent}%`, 
                height: "100%", 
                background: item.color, 
                transition: "width 0.5s ease",
                ...borderRadius
              } 
            })
          ),
          // Porcentaje a la derecha
          h("div", { style: { width: 62, textAlign: "right", fontSize: 14, fontWeight: 600, color: "#fff", flexShrink: 0 } },
            `${item.value.toFixed(1)}%`
          )
        );
      })
    );
  };

  return h("div", { style: cardFlatStyle },
    // --- Assets ---
    h("div", { style: { marginBottom: 32 } },
      h("div", { style: { position: "relative", height: 220, marginBottom: 16 } },
        h(DonutChart, { data: assetData.map(d => ({ name: d.name, value: d.value })), colors: assetData.map(d => d.color) })
      ),
      h("div", { style: { fontSize: 14, fontWeight: 600, marginBottom: 8, color: "#fff" } }, "Distribution by Asset (%)"),
      renderBars(assetData)
    ),
    // --- Sectores ---
    h("div", { style: { marginBottom: 32 } },
      h("div", { style: { position: "relative", height: 220, marginBottom: 16 } },
        h(DonutChart, { data: sectorData.map(d => ({ name: d.name, value: d.value })), colors: sectorData.map(d => d.color) })
      ),
      h("div", { style: { fontSize: 14, fontWeight: 600, marginBottom: 8, color: "#fff" } }, "Distribution by Sector (%)"),
      renderBars(sectorData)
    ),
    // --- Location ---
    h("div", { style: { marginBottom: 32 } },
      h("div", { style: { position: "relative", height: 220, marginBottom: 16 } },
        h(DonutChart, { data: locationData.map(d => ({ name: d.name, value: d.value })), colors: locationData.map(d => d.color) })
      ),
      h("div", { style: { fontSize: 14, fontWeight: 600, marginBottom: 8, color: "#fff" } }, "Distribution by Location (%)"),
      renderBars(locationData)
    )
  );
}