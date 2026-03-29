# Portfolio Tracker - AI Agent Instructions

## Project Overview
Aplicación web para seguimiento de cartera de inversiones. Obtiene precios de Yahoo Finance y movimientos desde Google Sheets, mostrando dashboard con P&L y distribución.

## Tech Stack
- Frontend: React 18 (sin build, vía CDN)
- Backend (scripts): Python 3.10+
- Dependencias: yfinance, pandas, requests, beautifulsoup4
- Hosting: GitHub Pages + GitHub Actions

## Estructura del Proyecto

portfolio-tracker/
├── index.html              # App React (todo en un archivo)
├── scripts/
│   ├── fetch_prices.py     # Obtiene precios de Yahoo Finance + FT
│   └── fetch_movements.py  # Lee movimientos de Google Sheets CSV
├── data/                   # JSON generados (prices.json, movements.json)
├── .github/workflows/
│   └── refresh_prices.yml  # GitHub Actions (cada 30 min)
├── requirements.txt        # Dependencias Python
└── .gitignore

## Comandos de Desarrollo

python -m http.server 8000       # Servidor local
python scripts/fetch_prices.py   # Generar precios localmente
python scripts/fetch_movements.py # Generar movimientos localmente
pip install -r requirements.txt  # Instalar dependencias

## Formato de Datos

### prices.json

{
  "precios": [
    { "ticker": "XNAS", "precio": 46.86, "moneda": "EUR" }
  ]
}

### movements.json

{
  "movements": [
    { "ticker": "XNAS", "way": "BUY", "baseAmt": 10, "quoteAmt": 468.60, "feeAmt": 0, "feeCur": "EUR", "date": "2025-06-02" }
  ]
}

## Mapeo de Tickers
Los tickers en movimientos (ej: IE00BYWYCC39) se muestran como nombres legibles (ej: EMRG) en la interfaz mediante TICKER_MAP en index.html.

## Reglas de Código
- Usar Python 3.10+
- Manejar errores con try/except por cada ticker
- Forzar fetch sin caché con ?t=${Date.now()}
- Los precios se actualizan cada 30 min via GitHub Actions