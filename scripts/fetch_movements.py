import requests
import json
import os
from datetime import datetime

# ============================================
# CONFIGURACIÓN
# ============================================
# URL pública de tu hoja de movimientos (CSV)
MOVEMENTS_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vR1dG5xV9pm-btNHr2XxMUey0wTh6e-XmvcRfzZeKsgJorPXeCRd1kLjc7xCRaTm4vuRgFEf3xnJ5ex/pub?gid=40406962&single=true&output=csv"

OUTPUT_FILE = "data/movements.json"

def fetch_movements_from_sheets():
    """
    Obtiene movimientos desde Google Sheets CSV con el formato específico
    Columnas esperadas:
    Date, Way, Base amount, Base currency (name), Base type, Quote amount, 
    Quote currency, Exchange, Sent/Received from, Sent to, Fee amount, 
    Fee currency (name), Broker, Notes
    """
    try:
        print("📊 Obteniendo movimientos desde Google Sheets...")
        response = requests.get(MOVEMENTS_URL, timeout=30)
        response.raise_for_status()
        
        lines = response.text.strip().split('\n')
        if len(lines) < 2:
            print("⚠️ No hay datos en la hoja")
            return []
        
        # Saltar la primera línea (encabezados)
        movements = []
        errores = 0
        
        for i, line in enumerate(lines[1:], start=2):
            if not line.strip():
                continue
            
            values = line.split(',')
            
            # Mapear columnas según el orden de tu CSV
            # 0: Date, 1: Way, 2: Base amount, 3: Base currency, 4: Base type, 
            # 5: Quote amount, 6: Quote currency, ...
            # 10: Fee amount, 11: Fee currency
            
            try:
                # Extraer datos básicos
                date = values[0].strip() if len(values) > 0 else ""
                way = values[1].strip().upper() if len(values) > 1 else ""
                
                # Solo procesar BUY/SELL
                if way not in ['BUY', 'SELL']:
                    continue
                
                # Cantidad base (acciones, BTC, etc.)
                base_amt = float(values[2]) if len(values) > 2 and values[2] else 0
                
                # El ticker está en "Base currency (name)" - columna 3
                ticker_raw = values[3].strip() if len(values) > 3 else ""
                
                # Mapear XNAS a ETF más legible o dejarlo como está
                # XNAS generalmente es un ETF, podemos dejarlo o cambiarlo
                ticker = ticker_raw
                
                # Quote amount (dinero invertido en EUR)
                quote_amt = float(values[5]) if len(values) > 5 and values[5] else 0
                
                # Fee amount y currency
                fee_amt = 0
                fee_cur = "EUR"
                if len(values) > 10 and values[10]:
                    try:
                        fee_amt = float(values[10])
                    except:
                        fee_amt = 0
                if len(values) > 11 and values[11]:
                    fee_cur = values[11].strip()
                
                # Si el ticker está vacío, intentar usar Base type
                if not ticker or ticker == "":
                    ticker = values[4].strip() if len(values) > 4 else "UNKNOWN"
                
                movement = {
                    "ticker": ticker,
                    "way": way,
                    "baseAmt": base_amt,
                    "quoteAmt": quote_amt,
                    "feeAmt": fee_amt,
                    "feeCur": fee_cur,
                    "date": date
                }
                movements.append(movement)
                print(f"   ✅ Fila {i}: {ticker} - {way} - {base_amt} unidades - €{quote_amt}")
                
            except ValueError as e:
                errores += 1
                print(f"   ⚠️ Fila {i}: Error - {e}")
                continue
            except Exception as e:
                errores += 1
                print(f"   ⚠️ Fila {i}: Error inesperado - {e}")
                continue
        
        print(f"\n📊 Resumen: {len(movements)} movimientos válidos, {errores} errores")
        return movements
        
    except Exception as e:
        print(f"❌ Error general: {e}")
        return []

def save_movements(movements):
    """Guarda movimientos en JSON"""
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    
    data = {
        "movements": movements,
        "updated": datetime.now().isoformat(),
        "source": "google_sheets",
        "total_movements": len(movements)
    }
    
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"\n💾 Movimientos guardados en {OUTPUT_FILE}")

def main():
    print("=" * 50)
    print("🔄 OBTENIENDO MOVIMIENTOS DESDE GOOGLE SHEETS")
    print("=" * 50)
    
    movements = fetch_movements_from_sheets()
    
    if movements:
        save_movements(movements)
        print(f"\n✅ Total: {len(movements)} movimientos procesados")
    else:
        print("\n⚠️ No se obtuvieron movimientos")

if __name__ == "__main__":
    main()