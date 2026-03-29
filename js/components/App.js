import { PRICES_URL, MOVEMENTS_URL, COLORS } from '../config.js';
import { getDisplayName, fmt, pct } from '../utils.js';
import { calcPositions } from '../calculations.js';
import { Header } from './Header.js';
import { MetricCards } from './MetricCards.js';
import { DashboardTab } from './DashboardTab.js';
import { DistributionTab } from './DistributionTab.js';
import { PositionsTab } from './PositionsTab.js';
import { PricesTab } from './PricesTab.js';
import { getTickerColor } from '../config.js';
import { UnderlyingTab } from './UnderlyingTab.js';

const { createElement: h, useState, useEffect, useCallback } = React;

export function App() {
  const [tab, setTab] = useState("Dashboard");
  const [prices, setPrices] = useState({});
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [pricesRes, movsRes] = await Promise.all([
        fetch(PRICES_URL),
        fetch(MOVEMENTS_URL)
      ]);
      
      if (!pricesRes.ok) throw new Error(`Prices HTTP ${pricesRes.status}`);
      if (!movsRes.ok) throw new Error(`Movements HTTP ${movsRes.status}`);

      const pricesData = await pricesRes.json();
      const movsData = await movsRes.json();

      const priceMap = {};
      (pricesData.precios || []).forEach(({ ticker, precio, moneda }) => {
        if (ticker) {
          priceMap[ticker.toUpperCase().trim()] = { precio: parseFloat(precio) || 0, moneda: moneda || "EUR" };
        }
      });
      
      setPrices(priceMap);
      setPositions(calcPositions(movsData.movements || []));
      setLastUpdate(new Date());
      
      console.log(`✅ Data loaded: ${Object.keys(priceMap).length} prices, ${(movsData.movements || []).length} movements`);
    } catch (e) {
      console.error("Error fetching data:", e);
      setError(e.message);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

// Inside App component, when creating enriched:
const enriched = positions.map((p, i) => {
  const info = prices[p.originalTicker] || {};
  const currentPrice = info.precio || 0;
  const currentValue = currentPrice * p.units;
  const pl = currentValue - p.totalInvested;
  const plPct = p.totalInvested > 0 ? (pl / p.totalInvested) * 100 : 0;
  return {
    ...p,
    currentPrice,
    currentValue,
    pl,
    plPct,
    color: getTickerColor(p.ticker),  // ← Global color function
    lastUpdate
  };
});

  const totalValue = enriched.reduce((s, p) => s + (p.currentValue || 0), 0);
  const totalInvested = enriched.reduce((s, p) => s + p.totalInvested, 0);
  const totalPL = totalValue - totalInvested;
  const totalPLPct = totalInvested > 0 ? (totalPL / totalInvested) * 100 : 0;

  const pieData = enriched
    .filter(p => p.currentValue > 0)
    .map(p => ({ name: getDisplayName(p.ticker), value: parseFloat(((p.currentValue / totalValue) * 100).toFixed(2)) }));

  const tabs = ["Dashboard", "Positions", "Distribution", "Underlying"];

  // Shared styles
  const cardStyle = { background: "#1C1C1E", borderRadius: 16, padding: "4px 16px", marginBottom: 12 };
  const cardFlatStyle = { background: "#1C1C1E", borderRadius: 16, padding: 16, marginBottom: 12 };
  const rowStyle = (border) => ({ display: "flex", alignItems: "center", padding: "13px 0", borderBottom: border ? "0.5px solid #2C2C2E" : "none" });
  const emptyCard = (msg) => h("div", { style: { ...cardFlatStyle, textAlign: "center", padding: "40px 20px", color: "#636366", fontSize: 15 } }, msg);
  const segBtn = (active) => ({ flex: 1, padding: "8px 4px", border: "none", borderRadius: 10, fontSize: 13, fontWeight: active ? 600 : 400, background: active ? "#2C2C2E" : "transparent", color: active ? "#fff" : "#636366", boxShadow: active ? "0 1px 4px rgba(0,0,0,0.5)" : "none" });

  return h("div", { style: { minHeight: "100vh", paddingBottom: 40 } },
    // Header
    h(Header, { lastUpdate, loading, error, onRefresh: fetchAll }),
    
    // Error banner
    error && h("div", { style: { margin: "0 16px 12px", background: "#2C1A1A", borderRadius: 12, padding: "12px 14px", fontSize: 13, color: "#FF375F" } }, error),
    
    // Metric cards
    h(MetricCards, { totalValue, totalInvested, totalPL, totalPLPct, positionsCount: positions.length, pricesCount: Object.keys(prices).length }),
    
    // Tabs navigation
    h("div", { style: { display: "flex", background: "#1C1C1E", borderRadius: 12, padding: 3, margin: "0 16px 16px" } },
      tabs.map(t => h("button", { key: t, onClick: () => setTab(t), style: segBtn(tab === t) }, t))
    ),
    
    // Tab content
    h("div", { style: { padding: "0 16px" } },
      tab === "Dashboard" && h(DashboardTab, { enriched, cardStyle, rowStyle, emptyCard }),
      tab === "Distribution" && h(DistributionTab, { pieData, enriched, totalValue, COLORS, cardFlatStyle, emptyCard }),
      tab === "Positions" && h(PositionsTab, { enriched, totalValue, cardStyle, emptyCard }),
      tab === "Underlying" && h(UnderlyingTab, { cardStyle, emptyCard })
    )
  );
}