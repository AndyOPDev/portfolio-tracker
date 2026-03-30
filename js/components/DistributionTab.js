import { getDisplayName, fmt, useIsMobile } from '../utils.js';
import { DonutChart, HorizontalBarChart } from '../charts.js';
import { getTickerColor, getSectorColor, getLocationColor } from '../config.js';

const { createElement: h, useState, useEffect, useRef } = React;

export function DistributionTab({ enriched, totalValue, cardFlatStyle, emptyCard, underlying }) {
  const isMobile = useIsMobile();

  if (!underlying || underlying.length === 0) {
    return emptyCard("No underlying data available");
  }

  // --- Data by Asset ---
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

  // --- Data by Sector ---
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
      color: getSectorColor(name),
      currentValue: value
    }))
    .sort((a, b) => b.value - a.value);

  // --- Data by Location ---
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
      color: getLocationColor(name),
      currentValue: value
    }))
    .sort((a, b) => b.value - a.value);

  // Componente de barra sin fondo gris
  const AnimatedBar = ({ item, maxValue, delay }) => {
    const [width, setWidth] = useState(0);

    useEffect(() => {
      const timer = setTimeout(() => {
        const widthPercent = (item.value / maxValue) * 100;
        setWidth(widthPercent);
      }, delay);
      return () => clearTimeout(timer);
    }, [item.value, maxValue, delay]);

    return h("div", {
      style: { 
        width: `${width}%`, 
        height: "100%", 
        background: item.color, 
        borderRadius: 8,
        transition: "width 1s cubic-bezier(0.22, 0.97, 0.36, 1)",
        boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
      } 
    });
  };

  // Helper to render bars (sin fondo gris)
  const renderBars = (data) => {
    if (!data || data.length === 0) return null;
    const maxValue = Math.max(...data.map(d => d.value));

    return h("div", { style: { flex: 1, width: "100%" } },
      data.map((item, idx) => {
        return h("div", {
          key: item.name + idx,
          style: { 
            marginBottom: 14, 
            display: "flex", 
            alignItems: "center", 
            gap: isMobile ? 10 : 12,
            width: "100%"
          }
        },
          // Label with color dot
          h("div", { 
            style: { 
              width: isMobile ? 110 : 140, 
              flexShrink: 0, 
              display: "flex", 
              alignItems: "center", 
              gap: 8, 
              fontSize: isMobile ? 12 : 13,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap"
            } 
          },
            h("div", { style: { width: 10, height: 10, borderRadius: 2, background: item.color, flexShrink: 0 } }),
            h("span", { 
              style: { color: "#fff", overflow: "hidden", textOverflow: "ellipsis" },
              title: `${item.name}\n€${fmt(item.currentValue)} (${item.value.toFixed(1)}%)`
            }, item.name)
          ),
          // Bar container (sin fondo gris)
          h("div", { 
            style: { 
              flex: 1, 
              height: 32, 
              position: "relative",
              overflow: "hidden",
              borderRadius: 8
            } 
          },
            h(AnimatedBar, { item, maxValue, delay: idx * 80 })
          ),
          // Percentage value
          h("div", { 
            style: { 
              width: 55, 
              textAlign: "right", 
              fontSize: isMobile ? 12 : 13, 
              fontWeight: 500, 
              color: "#fff", 
              flexShrink: 0,
              fontFeatureSettings: "'tnum'"
            } 
          },
            `${item.value.toFixed(1)}%`
          )
        );
      })
    );
  };

  // Block component with responsive layout
  const DistributionBlock = ({ title, data }) => {
    if (!data || data.length === 0) return null;
    
    const containerStyle = isMobile
      ? { display: "flex", flexDirection: "column", gap: 24, alignItems: "center", width: "100%" }
      : { display: "flex", flexDirection: "row", gap: 32, alignItems: "flex-start" };
    
    const donutStyle = isMobile
      ? { width: 200, height: 200, margin: "0 auto" }
      : { width: 220, height: 220, flexShrink: 0 };
    
    const barsStyle = isMobile
      ? { width: "100%" }
      : { flex: 1 };
    
    const titleStyle = {
      fontSize: isMobile ? 16 : 18,
      fontWeight: 600,
      color: "#fff",
      marginBottom: 16,
      ...(isMobile ? { textAlign: "center" } : {})
    };
    
    return h("div", { style: { marginBottom: 48 } },
      h("div", { style: titleStyle }, title),
      h("div", { style: containerStyle },
        h("div", { style: donutStyle },
          h(DonutChart, { 
            data: data.map(d => ({ name: d.name, value: d.value, currentValue: d.currentValue })), 
            colors: data.map(d => d.color)
          })
        ),
        h("div", { style: barsStyle },
          renderBars(data)
        )
      )
    );
  };

  return h("div", { style: cardFlatStyle },
    h(DistributionBlock, { title: "Asset Allocation", data: assetData }),
    sectorData.length > 0 && h(DistributionBlock, { title: "Sector Breakdown", data: sectorData }),
    locationData.length > 0 && h(DistributionBlock, { title: "Geographic Distribution", data: locationData })
  );
}