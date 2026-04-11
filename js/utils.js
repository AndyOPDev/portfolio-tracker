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

// En utils.js, añade esta función:

// Palabras que deben preservarse en mayúsculas
const PRESERVE_UPPER  = [
  'KLA', 'AMD', 'IBM', 'TSMC', 'CEO', 'CFO', 'CTO', 'USA', 'UK', 'EU',
  'AI', 'API', 'URL', 'HTML', 'CSS', 'JS', 'PDF', 'XML', 'JSON', 'SQL',
  'HTTP', 'HTTPS', 'FTP', 'SSH', 'SSL', 'TLS', 'VPN', 'RAM', 'CPU', 'GPU',
  'HDD', 'SSD', 'USB', 'LED', 'LCD', 'OLED', '4K', '8K', 'HD', 'UHD',
  'GPS', 'WiFi', 'NFC', 'RFID', 'SIM', 'PIN', 'OTP', '2FA', 'MFA', 'USD',
  'NVIDIA', 'ASML', 'IDEXX', 'HDFC', 'ICICI', 'JD.COM','CTBC', 'NXP'
];

// Palabras que deben ir en minúsculas (excepto primera letra)
// Ejemplo: INC → Inc, CORP → Corp, LTD → Ltd, LLC → Llc
const PRESERVE_TITLE  = [
  'INC', 'CORP', 'LTD', 'LLC', 'LP', 'PLC', 'AG', 'SE', 'SA',
  'GMBH', 'SRL', 'BV', 'OY', 'APS', 'SIA', 'KFT', 'SPA', 'SRO', 'LAM', 'COM', 'TWO', 'DR', 'HON','HAI', 'NON','PRE','THE'
];

export function toTitleCase(str) {
  if (!str) return "";
  
  const words = str.split(' ');
  
  const result = words.map(word => {
    const upperWord = word.toUpperCase();
    
    // 1. Preservar siglas (ej: KLA, AMD)
    if (PRESERVE_UPPER.includes(upperWord)) {
      return upperWord;
    }
    
    // 2. Palabras como INC, CORP → Inc, Corp
    if (PRESERVE_TITLE.includes(upperWord)) {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }
    
    // 3. Palabras de 2 letras → FORZAR MAYÚSCULAS (ON, IN, UP, etc.)
    if (word.length === 2) {
      return word.toUpperCase();
    }
    
    // 4. Palabras de 3 letras que son siglas (todo mayúsculas)
    if (word.length === 3 && word === word.toUpperCase() && /^[A-Z]{3}$/.test(word)) {
      return word;
    }
    
    // 5. Capitalizar normal
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });
  
  return result.join(' ');
}