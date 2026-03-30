import { TICKER_NAMES } from './config.js';

const { useState, useEffect } = React;

export function getDisplayName(ticker) {
  return TICKER_NAMES[ticker] || ticker;
}

export function fmt(n, d = 2) {
  return Number(n).toLocaleString("es-ES", { minimumFractionDigits: d, maximumFractionDigits: d });
}

export function fmtEur(n) {
  return Math.round(n).toLocaleString("es-ES");
}

export function pct(n) {
  return (n >= 0 ? "+" : "-") + fmt(Math.abs(n)) + "%";
}

// Add this function to utils.js
export function formatNumber(n) {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// Hook to detect mobile screen size
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}