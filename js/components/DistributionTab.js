import { getDisplayName, fmt, useIsMobile } from '../utils.js';
import { DonutChart } from '../charts.js';
import { getTickerColor, getSectorColor, getLocationColor } from '../config.js';

const { createElement: h, useState, useEffect, useRef } = React;

// Helper function for thousands separator
const formatNumber = (num) => {
  return Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

export function DistributionTab({ enriched, totalValue, cardFlatStyle, emptyCard, underlying }) {
  const isMobile = useIsMobile();

  if (!underlying || underlying.length === 0) {
    return emptyCard("No underlying data available");
  }

  // --- Data by Asset (NO filter, show all) ---
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

  // --- Data by Sector (filter out < 0.5%) ---
  const sectorMap = {};
  underlying.forEach(u => {
    const sector = u.sector || "Unknown";
    if (!sectorMap[sector]) sectorMap[sector] = 0;
    sectorMap[sector] += u.value;
  });
  const totalUnderlyingValue = underlying.reduce((s, u) => s + u.value, 0);
  
  const sectorDataRaw = Object.entries(sectorMap)
    .map(([name, value]) => ({
      name,
      value: parseFloat(((value / totalUnderlyingValue) * 100).toFixed(2)),
      color: getSectorColor(name),
      currentValue: value
    }))
    .sort((a, b) => b.value - a.value);
  
  const sectorData = sectorDataRaw.filter(item => item.value >= 0.5);

  // --- Data by Location (group < 1% into "Other") ---
  const locMap = {};
  underlying.forEach(u => {
    const loc = u.location || "Other";
    if (!locMap[loc]) locMap[loc] = 0;
    locMap[loc] += u.value;
  });
  
  const LOCATION_THRESHOLD = 1;
  const mainLocations = [];
  let otherValue = 0;
  
  Object.entries(locMap).forEach(([name, value]) => {
    const percentage = (value / totalUnderlyingValue) * 100;
    if (percentage >= LOCATION_THRESHOLD) {
      mainLocations.push({
        name,
        value: parseFloat(percentage.toFixed(2)),
        color: getLocationColor(name),
        currentValue: value
      });
    } else {
      otherValue += value;
    }
  });
  
  mainLocations.sort((a, b) => b.value - a.value);
  
  const locationData = [...mainLocations];
  if (otherValue > 0) {
    const otherPercentage = (otherValue / totalUnderlyingValue) * 100;
    locationData.push({
      name: "Other",
      value: parseFloat(otherPercentage.toFixed(2)),
      color: "#636366",
      currentValue: otherValue
    });
  }

  // Bar item component with formatted tooltip
  const BarItem = ({ item, maxValue, idx }) => {
    const [showTooltip, setShowTooltip] = useState(false);
    const [width, setWidth] = useState(0);
    
    useEffect(() => {
      const timer = setTimeout(() => {
        const widthPercent = (item.value / maxValue) * 100;
        setWidth(widthPercent);
      }, idx * 50);
      return () => clearTimeout(timer);
    }, [item.value, maxValue, idx]);

    const formattedValue = `€${formatNumber(item.currentValue)}`;

    return h("div", {
      style: { 
        marginBottom: 14, 
        display: "flex", 
        alignItems: "center", 
        gap: isMobile ? 10 : 12,
        width: "100%",
        position: "relative"
      }
    },
      h("div", { 
        style: { 
          width: isMobile ? 100 : 110, 
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
          title: `${item.name}\n€${formatNumber(item.currentValue)} (${item.value.toFixed(1)}%)`
        }, item.name)
      ),
      h("div", { 
        style: { 
          flex: 1, 
          height: 32, 
          background: "#2C2C2E", 
          borderRadius: 8, 
          position: "relative"
        },
        onMouseEnter: () => setShowTooltip(true),
        onMouseLeave: () => setShowTooltip(false)
      },
        h("div", { 
          style: { 
            width: `${width}%`, 
            height: "100%", 
            background: item.color, 
            borderRadius: 8,
            transition: "width 0.6s cubic-bezier(0.22, 0.97, 0.36, 1)",
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
          } 
        }),
        showTooltip && h("div", {
          style: {
            position: "absolute",
            top: -30,
            left: `${Math.min(width, 90)}%`,
            transform: "translateX(-50%)",
            background: "#1C1C1E",
            color: "#fff",
            padding: "4px 10px",
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 500,
            whiteSpace: "nowrap",
            zIndex: 100,
            boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
            pointerEvents: "none",
            border: "1px solid #2C2C2E"
          }
        }, formattedValue)
      ),
      h("div", { 
        style: { 
          width: 50, 
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
  };

  // Helper to render bars
  const renderBars = (data, showEmptyMessage = true) => {
    if (!data || data.length === 0) {
      if (showEmptyMessage) {
        return h("div", { style: { padding: "20px", textAlign: "center", color: "#636366" } }, 
          "No data (all items below threshold)"
        );
      }
      return null;
    }
    const maxValue = Math.max(...data.map(d => d.value));

    return h("div", { style: { flex: 1, width: "100%" } },
      data.map((item, idx) => h(BarItem, { key: item.name + idx, item, maxValue, idx }))
    );
  };

  // Block component
  const DistributionBlock = ({ title, data, showEmptyMessage = true, note }) => {
    if (!data || data.length === 0) return null;
    
    const containerStyle = isMobile
      ? { display: "flex", flexDirection: "column", gap: 20, alignItems: "center", width: "100%" }
      : { display: "flex", flexDirection: "row", gap: 32, alignItems: "flex-start" };
    
    const donutStyle = isMobile
      ? { width: 180, height: 180, margin: "0 auto" }
      : { width: 200, height: 200, flexShrink: 0 };
    
    const barsStyle = isMobile
      ? { width: "100%" }
      : { flex: 1 };
    
    const titleStyle = isMobile
      ? { fontSize: 16, fontWeight: 600, color: "#fff", textAlign: "center", width: "100%" }
      : { fontSize: 18, fontWeight: 600, color: "#fff" };
    
    return h("div", { style: { marginBottom: 48 } },
      h("div", { style: { marginBottom: 20 } },
        h("div", { style: titleStyle }, title),
        note && h("div", { style: { fontSize: 11, color: "#636366", marginTop: 4, textAlign: "center" } }, note)
      ),
      h("div", { style: containerStyle },
        h("div", { style: donutStyle },
          h(DonutChart, { 
            data: data.map(d => ({ name: d.name, value: d.value, currentValue: d.currentValue })), 
            colors: data.map(d => d.color)
          })
        ),
        h("div", { style: barsStyle },
          renderBars(data, showEmptyMessage)
        )
      )
    );
  };

  const sectorNote = sectorDataRaw.length !== sectorData.length 
    ? `${sectorDataRaw.length - sectorData.length} sectors below 0.5% hidden`
    : null;
  
  const locationNote = locationData.some(l => l.name === "Other")
    ? `Locations below 1% grouped as "Other"`
    : null;

  return h("div", { style: cardFlatStyle },
    h(DistributionBlock, { title: "Asset Allocation", data: assetData, showEmptyMessage: false }),
    sectorData.length > 0 && h(DistributionBlock, { title: "Sector Breakdown", data: sectorData, note: sectorNote }),
    locationData.length > 0 && h(DistributionBlock, { title: "Geographic Distribution", data: locationData, note: locationNote })
  );
}