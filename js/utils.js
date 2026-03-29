import { TICKER_NAMES } from './config.js';

export function getDisplayName(ticker) {
  return TICKER_NAMES[ticker] || ticker;
}

export function fmt(n, d = 2) {
  return Number(n).toLocaleString("es-ES", { minimumFractionDigits: d, maximumFractionDigits: d });
}

export function pct(n) {
  return (n >= 0 ? "+" : "-") + fmt(Math.abs(n)) + "%";
}