// App.js
import { PRICES_URL, MOVEMENTS_URL, UNDERLYING_URL, WORKER_URL, COLORS } from '../config.js';
import { getDisplayName, fmt, pct, formatNumber } from '../utils.js';
import { calcPositions } from '../calculations.js';
import { MetricCards } from './MetricCards.js';
import { DashboardTab } from './DashboardTab.js';
import { DistributionTab } from './DistributionTab.js';
import { UnderlyingTab } from './UnderlyingTab.js';
import { getTickerColor } from '../config.js';

const { createElement: h, useState, useEffect, useCallback } = React;

export function App() {
  const [tab, setTab] = useState("Dashboard");
  const [prices, setPrices] = useState({});
  const [positions, setPositions] = useState([]);
  const [underlying, setUnderlying] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastGitHubUpdate, setLastGitHubUpdate] = useState(null);
  
  // Precios en vivo
  const [livePrices, setLivePrices] = useState({});
  const [livePricesLoading, setLivePricesLoading] = useState(false);
  const [livePricesError, setLivePricesError] = useState(false);
  const [hasLivePrices, setHasLivePrices] = useState(false);
  const [lastLiveUpdate, setLastLiveUpdate] = useState(null);

  // Obtener precios en vivo con caché en app (60 segundos)
  const fetchLivePrices = useCallback(async () => {
    const now = Date.now();
    const timeSinceLastUpdate = lastLiveUpdate ? (now - lastLiveUpdate) / 1000 : null;
    
    //console.log("🔍 [CACHE CHECK] lastLiveUpdate:", lastLiveUpdate);
    //console.log("🔍 [CACHE CHECK] time since last update:", timeSinceLastUpdate, "seconds");
    
    // Si ya tenemos precios y han pasado menos de 60 segundos, no llamar al worker
    if (lastLiveUpdate && timeSinceLastUpdate < 60) {
      //console.log("📡 [CACHE HIT] Using cached live prices (", timeSinceLastUpdate.toFixed(1), "seconds old)");
      return;
    }
    
    //console.log("🔄 [CACHE MISS] Fetching fresh live prices from worker...");
    setLivePricesLoading(true);
    setLivePricesError(false);
    
    const tickers = ['XNAS', 'VVSM', 'BTC']; // EMRG no se pide (usa fallback diario)
    const results = {};
    let hasError = false;
    
    for (let i = 0; i < tickers.length; i++) {
      const ticker = tickers[i];
      try {
        // Delay de 1 segundo entre cada petición para evitar rate limit
        if (i > 0) {
          //console.log(`⏱️ Waiting 1 second before fetching ${ticker}...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        console.log(`📡 Fetching ${ticker} from worker...`);
        const response = await fetch(`${WORKER_URL}/price?ticker=${ticker}`);
        if (response.ok) {
          const data = await response.json();
          if (data.price) {
            results[ticker] = {
              price: data.price,
              change: data.change,
              changePercent: data.changePercent,
              live: true
            };
            console.log(`✅ ${ticker}: €${data.price}`);
          } else {
            console.warn(`⚠️ ${ticker}: No price in response`);
            hasError = true;
          }
        } else {
          console.warn(`⚠️ ${ticker}: HTTP ${response.status}`);
          hasError = true;
        }
      } catch (error) {
        console.error(`❌ Error fetching ${ticker}:`, error.message);
        hasError = true;
      }
    }
    
    if (Object.keys(results).length > 0) {
      setLivePrices(results);
      setHasLivePrices(true);
      setLastLiveUpdate(Date.now());
      console.log("💾 [CACHE SAVE] Saved live prices, next update available after 60 seconds");
    }
    if (hasError) {
      setLivePricesError(true);
    }
    setLivePricesLoading(false);
  }, [lastLiveUpdate]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      //console.log("📡 Fetching static data from GitHub...");
      const [pricesRes, movsRes, undRes] = await Promise.all([
        fetch(PRICES_URL),
        fetch(MOVEMENTS_URL),
        fetch(UNDERLYING_URL)
      ]);

      if (!pricesRes.ok) throw new Error(`Prices HTTP ${pricesRes.status}`);
      if (!movsRes.ok) throw new Error(`Movements HTTP ${movsRes.status}`);
      if (!undRes.ok) throw new Error(`Underlying HTTP ${undRes.status}`);

      const lastModified = pricesRes.headers.get('last-modified');
      const gitHubDate = lastModified ? new Date(lastModified) : null;
      setLastGitHubUpdate(gitHubDate);

      const pricesData = await pricesRes.json();
      const movsData = await movsRes.json();
      const underlyingData = await undRes.json();

      const priceMap = {};
      (pricesData.precios || []).forEach(({ ticker, precio, moneda }) => {
        if (ticker) {
          priceMap[ticker.toUpperCase().trim()] = { precio: parseFloat(precio) || 0, moneda: moneda || "EUR" };
        }
      });

      setPrices(priceMap);
      setPositions(calcPositions(movsData.movements || []));
      setUnderlying(underlyingData.underlying || []);

      console.log(`✅ Data loaded: ${Object.keys(priceMap).length} prices, ${(movsData.movements || []).length} movements`);
    } catch (e) {
      console.error("Error fetching data:", e);
      setError(e.message);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
    fetchLivePrices();
  }, []);

  // Enriquecer posiciones con precio (prioridad: live > static)
  const enriched = positions.map(p => {
    const livePrice = livePrices[p.ticker];
    const staticPrice = prices[p.originalTicker?.trim().toUpperCase()] || {};
    
    // EMRG siempre usa precio estático (fondo)
    let currentPrice, isLive;
    if (p.ticker === 'EMRG') {
      currentPrice = staticPrice.precio || 0;
      isLive = false;
    } else {
      currentPrice = livePrice?.price || staticPrice.precio || 0;
      isLive = !!livePrice?.price;
    }
    
    const currentValue = currentPrice * p.units;
    const pl = currentValue - p.totalInvested;

    return {
      ...p,
      currentPrice,
      currentValue,
      pl,
      plPct: p.totalInvested > 0 ? (pl / p.totalInvested) * 100 : 0,
      color: getTickerColor(p.ticker),
      isLive
    };
  });

  const totalValue = enriched.reduce((s, p) => s + (p.currentValue || 0), 0);
  const totalInvested = enriched.reduce((s, p) => s + p.totalInvested, 0);
  const totalPL = totalValue - totalInvested;
  const totalPLPct = totalInvested > 0 ? (totalPL / totalInvested) * 100 : 0;

  const pieData = enriched
    .filter(p => p.currentValue > 0)
    .map(p => ({ name: getDisplayName(p.ticker), value: parseFloat(((p.currentValue / totalValue) * 100).toFixed(2)) }));

  const tabs = ["Dashboard", "Distribution", "Underlying"];

  const cardStyle = { background: "#1C1C1E", borderRadius: 16, padding: "4px 16px", marginBottom: 12 };
  const cardFlatStyle = { background: "#1C1C1E", borderRadius: 16, padding: 16, marginBottom: 12 };
  const rowStyle = (border) => ({ display: "flex", alignItems: "center", padding: "13px 0", borderBottom: border ? "0.5px solid #2C2C2E" : "none" });
  const emptyCard = (msg) => h("div", { style: { ...cardFlatStyle, textAlign: "center", padding: "40px 20px", color: "#636366", fontSize: 15 } }, msg);
  const segBtn = (active) => ({ flex: 1, padding: "8px 4px", border: "none", borderRadius: 10, fontSize: 13, fontWeight: active ? 600 : 400, background: active ? "#2C2C2E" : "transparent", color: active ? "#fff" : "#636366", boxShadow: active ? "0 1px 4px rgba(0,0,0,0.5)" : "none", transition: "all 0.2s ease-in-out", cursor: "pointer" });

  return h("div", { style: { minHeight: "100vh", paddingBottom: 40 } },
    error && h("div", { style: { margin: "0 16px 12px", background: "#2C1A1A", borderRadius: 12, padding: "12px 14px", fontSize: 13, color: "#FF375F" } }, error),
    h(MetricCards, { 
      totalValue, 
      totalPL, 
      totalPLPct, 
      hasLivePrices,
      livePricesLoading,
      livePricesError
    }),
    h("div", { style: { display: "flex", background: "#1C1C1E", borderRadius: 12, padding: 3, margin: "0 16px 16px" } },
      tabs.map(t => h("button", { key: t, onClick: () => setTab(t), style: segBtn(tab === t) }, t))
    ),
    h("div", { style: { padding: "0 16px" } },
      tab === "Dashboard" && h(DashboardTab, { enriched, cardStyle, rowStyle, emptyCard }),
      tab === "Distribution" && h(DistributionTab, { enriched, totalValue, cardFlatStyle, emptyCard, underlying }),
      tab === "Underlying" && h(UnderlyingTab, { cardStyle, emptyCard })
    )
  );
}