// Detect if running locally or on GitHub Pages
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

export const PRICES_URL = isLocal 
  ? '/data/prices.json'
  : 'https://raw.githubusercontent.com/AndyOPDev/portfolio-tracker/main/data/prices.json';

export const MOVEMENTS_URL = isLocal
  ? '/data/movements.json'
  : 'https://raw.githubusercontent.com/AndyOPDev/portfolio-tracker/main/data/movements.json';

// Fallback color palette (when no specific color is defined)
export const COLORS = ["#0A84FF", "#30D158", "#FF9F0A", "#BF5AF2", "#FF375F", "#5AC8FA", "#FF6B35", "#98989D"];

// Specific colors for each ticker (applies everywhere)
export const TICKER_COLORS = {
  "XNAS": "#0A84FF",    // Blue - NASDAQ 100
  "VVSM": "#30D158",    // Green - Semiconductors
  "BTC": "#FF9F0A",     // Orange - Bitcoin
  "EMRG": "#BF5AF2",    // Purple - Emerging Markets
  "IE00BYWYCC39": "#BF5AF2"  // Purple - same as EMRG
};

// Function to get color for any ticker (used everywhere)
export function getTickerColor(ticker) {
  return TICKER_COLORS[ticker] || COLORS[0];
}

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