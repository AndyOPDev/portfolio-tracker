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

// Colores genéricos (fallback)
export const COLORS = ["#0A84FF", "#30D158", "#FF9F0A", "#BF5AF2", "#FF375F", "#5AC8FA", "#FF6B35", "#98989D"];

// Colores para tickers específicos
export const TICKER_COLORS = {
  "XNAS": "#5E5CE6",
  "VVSM": "#30D158",
  "BTC": "#FF9F0A",
  "BTC-USD": "#FF9F0A",
  "EMRG": "#BF5AF2",
  "IE00BYWYCC39": "#BF5AF2",
  // Nuevos colores rojos diferenciados
  "TSM": "#D32F2F",
  "AVGO": "#C62828",
  "NFLX": "#B71C1C",
  "TSLA": "#E82127",
  "AAPL": "#A2AAAD",
  "MSFT": "#F2C500",
  "NVDA": "#76B900",
  "GOOGL": "#EA4335",
  "GOOG": "#EA4335",
  "AMZN": "#FF9900",
  "META": "#0082fb"
};

// Colores para regiones
export const REGION_COLORS = {
  "United States": "#0A84FF",
  "Europe": "#7d1ee3",
  "China": "#FF9F0A",
  "Taiwan": "#f04b50",
  "India": "#ded41e",
  "Korea": "#5AC8FA",
  "Asia": "#FF6B35",
  "Latin America": "#9cd21e",
  "Middle East": "#17b33e",
  "Canada": "#c1dad9",
  "Africa": "#390439",
  "Global": "#b0234d",
  "Unknown": "#636366"
};

// Colores para sectores
export const SECTOR_COLORS = {
  "Information Technology": "#5E5CE6",
  "Consumer Discretionary": "#FFD60A",
  "Financials": "#2cb6e4",
  "Health Care": "#ff3776",
  "Communication": "#BF5AF2",
  "Crypto": "#FF9F0A",
  "Industrials": "#cec51f",
  "Consumer Staples": "#30D158",
  "Energy": "#FF453A",
  "Materials": "#AC8E68",
  "Utilities": "#0A84FF",
  "Real Estate": "#FF9500",
  "Unknown": "#636366"
};

// Función para obtener color de ticker (prioridad: color específico → color del sector → color por defecto)
export function getTickerColor(ticker, sector = null) {
  // 1. Si el ticker está directamente en TICKER_COLORS
  if (TICKER_COLORS[ticker]) {
    return TICKER_COLORS[ticker];
  }
  
  // 2. Normalizar ticker (eliminar sufijos)
  const normalized = ticker.replace(/-USD$/, '').replace(/-EUR$/, '');
  if (TICKER_COLORS[normalized]) {
    return TICKER_COLORS[normalized];
  }
  
  // 3. Buscar en TICKER_MAP inverso
  const mapped = Object.keys(TICKER_MAP).find(key => TICKER_MAP[key] === ticker);
  if (mapped && TICKER_COLORS[mapped]) {
    return TICKER_COLORS[mapped];
  }
  
  // 4. Usar color del sector si está disponible
  if (sector && SECTOR_COLORS[sector]) {
    return SECTOR_COLORS[sector];
  }
  
  // 5. Si no, usar color por defecto
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

// Función para obtener color por location (alias de getRegionColor)
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