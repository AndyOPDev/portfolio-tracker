import yfinance as yf
import json
import os
import requests
from bs4 import BeautifulSoup
from datetime import datetime

# ============================================
# CONFIGURACIÓN
# ============================================
# Mapeo de tickers de Google Sheets a tickers de Yahoo Finance
TICKER_MAP = {
    "XNAS": "XNAS.DU",
    "VVSM": "VVSM.DU",
    "IE00BYWYCC39": "IE00BYWYCC39",  # No funciona en yfinance
    "BTC": "BTC-EUR",
}

# Tickers que SABEMOS que NO funcionan con yfinance
# Para estos, vamos directamente a la fuente alternativa sin intentar yfinance
FORCE_FALLBACK_TICKERS = ["IE00BYWYCC39"]

# Fuentes alternativas para tickers que no funcionan con yfinance
FALLBACK_SOURCES = {
    "IE00BYWYCC39": {
        "source": "ft",
        "url": "https://markets.ft.com/data/funds/tearsheet/summary?s=IE00BYWYCC39:EUR",
        "name": "iShares Emerging Markets Index Fund"
    }
}

MOVEMENTS_FILE = "data/movements.json"
OUTPUT_FILE = "data/prices.json"

def get_price_from_ft(url):
    """Obtiene precio desde Financial Times mediante scraping"""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        response = requests.get(url, headers=headers, timeout=15)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Buscar el precio en la página
        # Método 1: Buscar por clase específica de FT
        price_elem = soup.find('span', class_='mod-ui-data-list__value')
        
        if not price_elem:
            # Método 2: Buscar cualquier elemento que contenga el precio
            # Buscar texto que parezca precio (XX.XX)
            import re
            text = soup.get_text()
            # Buscar patrón de precio: número con dos decimales
            match = re.search(r'(\d+\.\d{2})\s*€', text)
            if match:
                return float(match.group(1))
        
        if price_elem:
            price_text = price_elem.text.strip()
            import re
            match = re.search(r'([\d,]+\.?\d*)', price_text.replace(',', ''))
            if match:
                return float(match.group(1))
        
        print(f"   ⚠️ No se encontró el precio en la página")
        return None
        
    except Exception as e:
        print(f"   ❌ Error scraping FT: {e}")
        return None

def get_tickers_from_movements():
    """Obtiene la lista única de tickers desde movements.json"""
    try:
        with open(MOVEMENTS_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
        
        movements = data.get("movements", [])
        tickers = list(set([m.get("ticker") for m in movements if m.get("ticker")]))
        print(f"📋 Tickers encontrados en movimientos: {tickers}")
        return tickers
    except Exception as e:
        print(f"⚠️ No se pudo leer movements.json: {e}")
        return []

def fetch_price_for_ticker(ticker):
    """Obtiene precio para un ticker, usando la estrategia adecuada"""
    
    # Si el ticker está en la lista de forzados, ir directamente a alternativa
    if ticker in FORCE_FALLBACK_TICKERS:
        print(f"   🔄 Usando fuente alternativa directamente (evitando yfinance)...")
        
        if ticker in FALLBACK_SOURCES:
            source = FALLBACK_SOURCES[ticker]
            if source['source'] == 'ft':
                price = get_price_from_ft(source['url'])
                if price:
                    print(f"   ✅ €{price:.2f} (desde {source['name']})")
                    return price
                else:
                    print(f"   ❌ No se pudo obtener precio desde FT")
                    return None
    
    # Para el resto de tickers, intentar con yfinance primero
    yf_ticker = TICKER_MAP.get(ticker, ticker)
    
    try:
        print(f"   Intentando yfinance con {yf_ticker}...", end=" ")
        stock = yf.Ticker(yf_ticker)
        data = stock.history(period="1d", interval="1m")
        
        if not data.empty:
            latest = data.iloc[-1]
            price = float(latest["Close"])
            print(f"✅ €{price:.2f}")
            return price
        else:
            print(f"⚠️ Sin datos")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Si falla yfinance, intentar fuentes alternativas (excepto si ya intentamos)
    if ticker in FALLBACK_SOURCES and ticker not in FORCE_FALLBACK_TICKERS:
        source = FALLBACK_SOURCES[ticker]
        print(f"   Intentando fuente alternativa ({source['source']})...", end=" ")
        
        if source['source'] == 'ft':
            price = get_price_from_ft(source['url'])
            if price:
                print(f"✅ €{price:.2f}")
                return price
            else:
                print(f"❌ Falló")
    
    return None

def fetch_prices(tickers):
    """Obtiene precios para todos los tickers"""
    prices_list = []
    
    print("🔄 Obteniendo precios...")
    print("-" * 40)
    
    for ticker in tickers:
        print(f"📊 {ticker}:")
        price = fetch_price_for_ticker(ticker)
        
        if price is not None:
            prices_list.append({
                "ticker": ticker,
                "precio": round(price, 2),
                "moneda": "EUR"
            })
        else:
            print(f"   ⚠️ No se pudo obtener precio para {ticker}")
        print()
    
    return {"precios": prices_list}

def save_prices(data):
    """Guarda en el formato que espera la app"""
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print("-" * 40)
    print(f"💾 Guardado en {OUTPUT_FILE}")
    print(f"📈 {len(data['precios'])} precios actualizados")
    print(f"🕒 {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")



if __name__ == "__main__":
    tickers = get_tickers_from_movements()
    if tickers:
        data = fetch_prices(tickers)
        save_prices(data)
    else:
        print("⚠️ No se encontraron tickers en movements.json")