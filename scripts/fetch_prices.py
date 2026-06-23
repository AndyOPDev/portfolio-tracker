import yfinance as yf
import json
import os
import requests
from bs4 import BeautifulSoup
from datetime import datetime
import time

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
PRICES_HISTORY_FILE = "data/prices_history.json"

# Lista de tickers por defecto (para primera ejecución o fallback)
DEFAULT_TICKERS = ["XNAS", "VVSM", "BTC"]

# Configuración de reintentos
MAX_RETRIES = 5
RETRY_DELAY = 10  # segundos entre reintentos

def get_price_from_ft(url):
    """Obtiene precio desde Financial Times mediante scraping"""
    for attempt in range(MAX_RETRIES):
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
            
            print(f"   ⚠️ No se encontró el precio en la página (intento {attempt + 1}/{MAX_RETRIES})")
            
        except Exception as e:
            print(f"   ❌ Error scraping FT: {e} (intento {attempt + 1}/{MAX_RETRIES})")
        
        # Esperar antes de reintentar
        if attempt < MAX_RETRIES - 1:
            time.sleep(RETRY_DELAY)
    
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

def fetch_price_with_retry(ticker, fetch_function, *args, **kwargs):
    """Ejecuta una función con reintentos"""
    for attempt in range(MAX_RETRIES):
        try:
            result = fetch_function(*args, **kwargs)
            if result is not None:
                return result
        except Exception as e:
            print(f"   ⚠️ Error en intento {attempt + 1}/{MAX_RETRIES}: {e}")
        
        if attempt < MAX_RETRIES - 1:
            print(f"   🔄 Reintentando en {RETRY_DELAY}s...")
            time.sleep(RETRY_DELAY)
    
    return None

def fetch_yfinance_price(ticker):
    """Obtiene precio desde Yahoo Finance"""
    yf_ticker = TICKER_MAP.get(ticker, ticker)
    
    try:
        stock = yf.Ticker(yf_ticker)
        data = stock.history(period="1d", interval="1m")
        
        if not data.empty:
            latest = data.iloc[-1]
            price = float(latest["Close"])
            return price
        else:
            return None
    except Exception as e:
        return None

def fetch_price_for_ticker(ticker):
    """Obtiene precio para un ticker, usando la estrategia adecuada con reintentos"""
    
    # Si el ticker está en la lista de forzados, ir directamente a alternativa
    if ticker in FORCE_FALLBACK_TICKERS:
        print(f"   🔄 Usando fuente alternativa directamente (evitando yfinance)...")
        
        if ticker in FALLBACK_SOURCES:
            source = FALLBACK_SOURCES[ticker]
            if source['source'] == 'ft':
                price = fetch_price_with_retry(
                    ticker, 
                    get_price_from_ft, 
                    source['url']
                )
                if price:
                    print(f"   ✅ €{price:.2f} (desde {source['name']})")
                    return price
                else:
                    print(f"   ❌ No se pudo obtener precio desde FT después de {MAX_RETRIES} intentos")
                    return None
    
    # Para el resto de tickers, intentar con yfinance primero
    yf_ticker = TICKER_MAP.get(ticker, ticker)
    print(f"   Intentando yfinance con {yf_ticker}...")
    
    price = fetch_price_with_retry(ticker, fetch_yfinance_price, ticker)
    
    if price is not None:
        print(f"   ✅ €{price:.2f}")
        return price
    else:
        print(f"   ❌ Falló yfinance después de {MAX_RETRIES} intentos")
    
    # Si falla yfinance, intentar fuentes alternativas (excepto si ya intentamos)
    if ticker in FALLBACK_SOURCES and ticker not in FORCE_FALLBACK_TICKERS:
        source = FALLBACK_SOURCES[ticker]
        print(f"   Intentando fuente alternativa ({source['source']})...")
        
        if source['source'] == 'ft':
            price = fetch_price_with_retry(
                ticker, 
                get_price_from_ft, 
                source['url']
            )
            if price:
                print(f"   ✅ €{price:.2f}")
                return price
            else:
                print(f"   ❌ Falló fuente alternativa después de {MAX_RETRIES} intentos")
    
    return None

def load_previous_prices():
    """Carga los precios anteriores desde el archivo de histórico"""
    try:
        with open(PRICES_HISTORY_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            return data.get("prices", {})
    except:
        return {}

def save_price_history(price_dict):
    """Guarda el histórico de precios"""
    try:
        # Cargar histórico existente
        history = load_previous_prices()
        
        # Actualizar con nuevos precios
        today = datetime.now().strftime("%Y-%m-%d")
        for ticker, price in price_dict.items():
            if ticker not in history:
                history[ticker] = {}
            history[ticker][today] = price
            
            # Mantener solo últimos 30 días
            if len(history[ticker]) > 30:
                # Eliminar el más antiguo
                oldest = sorted(history[ticker].keys())[0]
                del history[ticker][oldest]
        
        with open(PRICES_HISTORY_FILE, "w", encoding="utf-8") as f:
            json.dump({"prices": history}, f, indent=2, ensure_ascii=False)
            
    except Exception as e:
        print(f"⚠️ No se pudo guardar histórico: {e}")

def get_last_known_price(ticker, previous_prices):
    """Obtiene el último precio conocido para un ticker"""
    if ticker in previous_prices:
        # Obtener la fecha más reciente
        dates = sorted(previous_prices[ticker].keys())
        if dates:
            last_date = dates[-1]
            return previous_prices[ticker][last_date]
    return None

def fetch_prices(tickers):
    """Obtiene precios para todos los tickers con reintentos y fallback a precios anteriores"""
    prices_list = []
    previous_prices = load_previous_prices()
    new_prices = {}
    failed_tickers = []
    
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
            new_prices[ticker] = round(price, 2)
            print(f"   ✅ Precio obtenido: €{price:.2f}")
        else:
            # Intentar usar precio anterior
            last_price = get_last_known_price(ticker, previous_prices)
            if last_price is not None:
                print(f"   ⚠️ Usando último precio conocido: €{last_price:.2f}")
                prices_list.append({
                    "ticker": ticker,
                    "precio": last_price,
                    "moneda": "EUR",
                    "nota": "precio_anterior"
                })
                new_prices[ticker] = last_price
            else:
                print(f"   ❌ No se pudo obtener precio para {ticker} (sin histórico)")
                failed_tickers.append(ticker)
        print()
    
    # Guardar histórico de precios
    if new_prices:
        save_price_history(new_prices)
    
    # Registrar tickers fallidos para monitoreo
    if failed_tickers:
        print(f"⚠️ Tickers sin precio: {failed_tickers}")
    
    return {"precios": prices_list, "fallidos": failed_tickers}

def save_prices(data):
    """Guarda en el formato que espera la app"""
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump({"precios": data["precios"]}, f, indent=2, ensure_ascii=False)
    
    print("-" * 40)
    print(f"💾 Guardado en {OUTPUT_FILE}")
    print(f"📈 {len(data['precios'])} precios actualizados")
    if data.get('fallidos'):
        print(f"⚠️ Tickers sin precio: {data['fallidos']}")
    print(f"🕒 {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

if __name__ == "__main__":
    # Intentar obtener tickers de movements.json
    tickers = get_tickers_from_movements()
    
    # Si no hay tickers (movements.json no existe o está vacío), usar lista por defecto
    if not tickers:
        print("⚠️ No se encontraron tickers en movements.json, usando lista por defecto")
        tickers = DEFAULT_TICKERS
    
    # Obtener precios y guardar
    data = fetch_prices(tickers)
    save_prices(data)
