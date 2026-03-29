import json
import pandas as pd
import os
from datetime import datetime

def calculate_underlying():
    """Calculate underlying portfolio from ETF holdings"""
    
    # Load movements and prices
    with open("data/movements.json", "r") as f:
        movs_data = json.load(f)
    
    with open("data/prices.json", "r") as f:
        prices_data = json.load(f)
    
    # Calculate positions (simplified)
    positions = {}
    for m in movs_data.get('movements', []):
        ticker = m['ticker']
        if m['way'] == "BUY":
            if ticker not in positions:
                positions[ticker] = {'units': 0, 'totalInvested': 0}
            positions[ticker]['units'] += m['baseAmt']
            positions[ticker]['totalInvested'] += m['quoteAmt']
    
    # Get current prices
    price_map = {p['ticker']: p['precio'] for p in prices_data.get('precios', [])}
    
    # Calculate current values
    etf_values = {}
    for ticker, pos in positions.items():
        current_price = price_map.get(ticker, 0)
        etf_values[ticker] = current_price * pos['units']
    
    total_value = sum(etf_values.values())
    
    # Load holdings
    holdings_dir = "data/holdings"
    if not os.path.exists(holdings_dir):
        print("Holdings directory not found")
        return
    
    all_holdings = []
    for file in os.listdir(holdings_dir):
        if file.endswith('_holdings.csv'):
            etf = file.replace('_holdings.csv', '')
            df = pd.read_csv(os.path.join(holdings_dir, file))
            if 'ticker' in df.columns and 'weight_pct' in df.columns:
                df['etf'] = etf
                all_holdings.append(df[['etf', 'ticker', 'name', 'weight_pct']])
    
    if not all_holdings:
        print("No holdings loaded")
        return
    
    holdings_df = pd.concat(all_holdings, ignore_index=True)
    
    # Calculate underlying
    underlying = {}
    for _, row in holdings_df.iterrows():
        etf = row['etf']
        ticker = row['ticker']
        name = row['name']
        weight = float(row['weight_pct']) / 100
        
        if etf in etf_values:
            value = etf_values[etf] * weight
            if ticker in underlying:
                underlying[ticker]['value'] += value
            else:
                underlying[ticker] = {'ticker': ticker, 'name': name, 'value': value}
    
    # Convert to list and calculate percentages
    underlying_list = []
    for ticker, data in underlying.items():
        pct = (data['value'] / total_value) * 100 if total_value > 0 else 0
        underlying_list.append({
            'ticker': ticker,
            'name': data['name'],
            'value': round(data['value'], 2),
            'pct': round(pct, 2)
        })
    
    underlying_list.sort(key=lambda x: x['value'], reverse=True)
    
    # Save to JSON
    with open("data/underlying.json", "w", encoding='utf-8') as f:
        json.dump({
            'underlying': underlying_list,
            'total_value': total_value,
            'updated': datetime.now().isoformat()
        }, f, indent=2)
    
    print(f"✅ Saved underlying with {len(underlying_list)} holdings")

if __name__ == "__main__":
    calculate_underlying()