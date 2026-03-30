// Detect if running locally or on GitHub Pages
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

export const PRICES_URL = isLocal 
  ? '/data/prices.json'
  : 'https://raw.githubusercontent.com/AndyOPDev/portfolio-tracker/main/data/prices.json';

export const MOVEMENTS_URL = isLocal
  ? '/data/movements.json'
  : 'https://raw.githubusercontent.com/AndyOPDev/portfolio-tracker/main/data/movements.json';

export const UNDERLYING_URL = isLocal
  ? '/data/underlying.json'
  : 'https://raw.githubusercontent.com/AndyOPDev/portfolio-tracker/main/data/underlying.json';

export const WORKER_URL = "https://portfolio-prices.andyhernandez1990.workers.dev";

// Colores genéricos (fallback)
export const COLORS = ["#0A84FF", "#30D158", "#FF9F0A", "#BF5AF2", "#FF375F", "#5AC8FA", "#FF6B35", "#98989D"];

// Colores para tickers específicos
// Colores para tickers específicos (ETFs y activos principales)
export const TICKER_COLORS = {
  // ETFs y activos principales
  "XNAS": "#0A84FF",
  "VVSM": "#30D158",
  "BTC": "#FF9F0A",
  "EMRG": "#BF5AF2",
  "IE00BYWYCC39": "#BF5AF2",
  
  // Empresas tecnológicas
  "AAPL": "#A2AAAD",      // Apple - gris plata
  "MSFT": "#F2C500",      // Microsoft - amarillo
  "NVDA": "#76B900",      // NVIDIA - verde Nvidia
  "GOOGL": "#EA4335",     // Google - rojo
  "GOOG": "#EA4335",      // Google - rojo
  "META": "#0082fb",      // Meta - azul
  "AMZN": "#FF9900",      // Amazon - naranja
  "TSLA": "#E82127",      // Tesla - rojo
  "NFLX": "#B71C1C",      // Netflix - rojo vino
  
  // Semiconductores
  "TSM": "#D32F2F",       // Taiwan Semiconductor - rojo intenso
  "AVGO": "#C62828",      // Broadcom - rojo oscuro
  "AMD": "#4A4A4A",       // AMD - gris plomo (contraste suficiente)
  "ASML": "#5A5A5E",      // ASML - gris acero
  "INTC": "#0A84FF",      // Intel - azul
  "QCOM": "#30D158",      // Qualcomm - verde
  
  // Otras empresas
  "JPM": "#5AC8FA",       // JPMorgan - azul claro
  "V": "#0A84FF",         // Visa - azul
  "JNJ": "#FF9F0A",       // Johnson & Johnson - naranja
  "PG": "#30D158",        // Procter & Gamble - verde
 // "WMT": "#BF5AF2",       // Walmart - morado
  "KO": "#FF375F",        // Coca-Cola - rojo
  "PEP": "#5AC8FA",       // Pepsi - azul claro
  "DIS": "#FF6B35",       // Disney - naranja coral
 // "COST": "#30D158",      // Costco - verde
 // "LIN": "#0A84FF",       // Linde - azul
  "SHOP": "#2f931b"       // Shopify - verde
};

// Colores para regiones
export const REGION_COLORS = {
  "United States": "#0A84FF",
  "Europe": "#30D158",
  "China": "#FF9F0A",
  "Taiwan": "#BF5AF2",
  "India": "#FF375F",
  "Korea": "#5AC8FA",
  "Asia": "#FF6B35",
  "South America": "#D2691E",
  "Canada": "#FFD700",
  "Africa": "#8B008B",
  "Global": "#b0234d",
  "Unknown": "#636366"
};

// Colores para sectores
export const SECTOR_COLORS = {
  "Information Technology": "#5E5CE6",
  "Consumer Discretionary": "#FF9F0A",
  "Financials": "#32D74B",
  "Health Care": "#FF375F",
  "Communication": "#BF5AF2",
  "Crypto": "#FFD60A",
  "Industrials": "#64D2FF",
  "Consumer Staples": "#30D158",
  "Energy": "#FF453A",
  "Materials": "#AC8E68",
  "Utilities": "#0A84FF",
  "Real Estate": "#FF9500",
  "Unknown": "#636366"
};

// Función para obtener color de ticker
export function getTickerColor(ticker, sector = null) {
  if (TICKER_COLORS[ticker]) {
    return TICKER_COLORS[ticker];
  }
  const normalized = ticker.replace(/-USD$/, '').replace(/-EUR$/, '');
  if (TICKER_COLORS[normalized]) {
    return TICKER_COLORS[normalized];
  }
  const mapped = Object.keys(TICKER_MAP).find(key => TICKER_MAP[key] === ticker);
  if (mapped && TICKER_COLORS[mapped]) {
    return TICKER_COLORS[mapped];
  }
  if (sector && SECTOR_COLORS[sector]) {
    return SECTOR_COLORS[sector];
  }
  return COLORS[0];
}

// Función para obtener color por región
export function getRegionColor(region) {
  return REGION_COLORS[region] || "#636366";
}

// Función para obtener color por sector
export function getSectorColor(sector) {
  return SECTOR_COLORS[sector] || "#636366";
}

// Función para obtener color por location
export function getLocationColor(location) {
  return REGION_COLORS[location] || "#636366";
}

// Nombres amigables para tickers
export const TICKER_NAMES = {
  "XNAS": "NASDAQ 100",
  "VVSM": "Semiconductor",
  "IE00BYWYCC39": "Emerging Markets",
  "BTC": "Bitcoin",
  "EMRG": "Emerging Markets"
};

export const TICKER_MAP = {
  "IE00BYWYCC39": "EMRG"
};