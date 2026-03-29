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

// Colores genéricos
export const COLORS = ["#0A84FF", "#30D158", "#FF9F0A", "#BF5AF2", "#FF375F", "#5AC8FA", "#FF6B35", "#98989D"];

// Colores para tickers específicos
export const TICKER_COLORS = {
  "XNAS": "#0A84FF",
  "VVSM": "#30D158",
  "BTC": "#FF9F0A",
  "EMRG": "#BF5AF2",
  "IE00BYWYCC39": "#BF5AF2"
};

// Colores para cada región
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
//export function getTickerColor(ticker) {
//  return TICKER_COLORS[ticker] || COLORS[0];
//}

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

// Nombre amigable para tickers
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

// config.js
export const TICKER_COLOR_MAP = {
  "XNAS": "#0A84FF",
  "VVSM": "#30D158",
 // "BTC": "#FF9F0A",
  "EMRG": "#BF5AF2",
  "IE00BYWYCC39": "#BF5AF2",

  BTC: "#F7931A",          // naranja Bitcoin
  NVDA: "#76B900",         // verde Nvidia
  AAPL: "#A2AAAD",         // gris plata Apple
  MSFT: "#F2C500",         // amarillo Microsoft
  GOOG: "#EA4335",         // rojo Google
  GOOGL: "#EA4335",         // rojo Google
  META: "#0082fb",          // azul mETA
  AMZN: "#FF9900",         // naranja Amazon
  TSM: "#D32F2F",          // rojo TSM
  AVGO: "#C62828",         // rojo Broadcom
  TSLA: "#E82127",         // rojo Tesla
  NFLX: "#D32F2F",         // rojo Netflix
  AVGO: "#C62828",         // rojo Broadcom
  COST: "#1976D2",         // verde Costco
  WMT: "#1976D2",          // azul Walmart
  LIN: "#F2C500",          // verde Linde
  PEP: "#1976D2",          // amarillo Pepsi
  //AMGN: "#0288D1",         // azul Amgen
  //GILD: "#0288D1",         // azul Gilead
  //ISRG: "#0288D1",         // azul Intuitive Surgical
  SHOP: "#2f931b"         // púrpura Shopify
  // añade más según sea necesario
};

export function getTickerColor(ticker) {
  return TICKER_COLOR_MAP[ticker] || TICKER_COLOR_MAP.DEFAULT;
}