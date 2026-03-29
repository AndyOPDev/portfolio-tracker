import json
import pandas as pd
import os
from datetime import datetime

def calculate_underlying():
    """Calculate underlying portfolio from ETF holdings + direct assets (BTC)"""

    # ------------------------
    # LOAD DATA
    # ------------------------

    with open("data/movements.json", "r") as f:
        movs_data = json.load(f)

    with open("data/prices.json", "r") as f:
        prices_data = json.load(f)

    # ------------------------
    # BUILD POSITIONS
    # ------------------------

    positions = {}

    for m in movs_data.get('movements', []):
        ticker = m['ticker']

        if m['way'] == "BUY":
            if ticker not in positions:
                positions[ticker] = {'units': 0, 'totalInvested': 0}

            positions[ticker]['units'] += m['baseAmt']
            positions[ticker]['totalInvested'] += m['quoteAmt']

    # ------------------------
    # PRICES
    # ------------------------

    price_map = {p['ticker']: p['precio'] for p in prices_data.get('precios', [])}

    etf_values = {}
    for ticker, pos in positions.items():
        current_price = price_map.get(ticker, 0)
        etf_values[ticker] = current_price * pos['units']

    total_value = sum(etf_values.values())

    # ------------------------
    # LOAD HOLDINGS (ETFs)
    # ------------------------

    holdings_dir = "data/holdings"

    if not os.path.exists(holdings_dir):
        print("Holdings directory not found")
        return

    all_holdings = []

    for file in os.listdir(holdings_dir):
        if file.endswith('_holdings.csv'):
            etf = file.replace('_holdings.csv', '')
            df = pd.read_csv(os.path.join(holdings_dir, file))

            required_cols = {'ticker', 'weight_pct'}
            if not required_cols.issubset(df.columns):
                continue

            df['etf'] = etf

            # Asegurar columnas opcionales
            if 'sector' not in df.columns:
                df['sector'] = ""
            if 'location' not in df.columns:
                df['location'] = ""

            all_holdings.append(df[['etf', 'ticker', 'name', 'weight_pct', 'sector', 'location']])

    holdings_df = pd.concat(all_holdings, ignore_index=True) if all_holdings else pd.DataFrame()

    # ------------------------
    # CALCULATE UNDERLYING
    # ------------------------

    underlying = {}

    for _, row in holdings_df.iterrows():
        etf = row['etf']
        ticker = row['ticker']

        if etf not in etf_values:
            continue

        weight = float(row['weight_pct']) / 100
        value = etf_values[etf] * weight

        if ticker not in underlying:
            underlying[ticker] = {
                'ticker': ticker,
                'name': row.get('name', ticker),
                'value': 0,
                'sector': row.get('sector', ''),
                'location': row.get('location', '')
            }

        underlying[ticker]['value'] += value

    # ------------------------
    # ADD DIRECT ASSETS (BTC)
    # ------------------------

    DIRECT_ASSETS = {
        "BTC": {
            "name": "Bitcoin",
            "sector": "Crypto",
            "location": "Global"
        }
    }

    for ticker, pos in positions.items():
        if ticker in DIRECT_ASSETS:
            value = etf_values.get(ticker, 0)

            if ticker not in underlying:
                underlying[ticker] = {
                    'ticker': ticker,
                    'name': DIRECT_ASSETS[ticker]['name'],
                    'value': 0,
                    'sector': DIRECT_ASSETS[ticker]['sector'],
                    'location': DIRECT_ASSETS[ticker]['location']
                }

            underlying[ticker]['value'] += value

    # ------------------------
    # FINAL LIST
    # ------------------------

    underlying_list = []

    for ticker, data in underlying.items():
        pct = (data['value'] / total_value) * 100 if total_value > 0 else 0

        underlying_list.append({
            'ticker': ticker,
            'name': data['name'],
            'value': round(data['value'], 2),
            'pct': round(pct, 2),
            'sector': data.get('sector', ''),
            'location': data.get('location', '')
        })

    underlying_list.sort(key=lambda x: x['value'], reverse=True)

    # ------------------------
    # SAVE
    # ------------------------

    with open("data/underlying.json", "w", encoding='utf-8') as f:
        json.dump({
            'underlying': underlying_list,
            'total_value': total_value,
            'updated': datetime.now().isoformat()
        }, f, indent=2)

    print(f"✅ Saved underlying with {len(underlying_list)} holdings")


if __name__ == "__main__":
    calculate_underlying()