import pandas as pd
import requests
import json
import os
import io  # ← Añadir esta línea al principio
from datetime import datetime

# URLs de los holdings
HOLDINGS_URLS = {
    "XNAS": "https://www.blackrock.com/uk/individual/products/253741/fund/1472631233320.ajax?fileType=csv&fileName=CNDX_holdings&dataType=fund",
    "EMRG": "https://www.ishares.com/uk/professional/en/products/239637/ishares-msci-emerging-markets-etf/1506575576011.ajax?fileType=csv&fileName=EEM_holdings&dataType=fund"
}

OUTPUT_DIR = "data/holdings"

def fetch_blackrock_csv(url, etf_ticker):
    """Fetch and parse BlackRock/iShares CSV holdings"""
    try:
        print(f"📊 Fetching {etf_ticker} holdings...")
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
        
        # Get raw text
        content = response.text
        
        # Find the header line (starts with "Ticker,Name,Sector")
        lines = content.strip().split('\n')
        header_line_idx = None
        
        for i, line in enumerate(lines):
            if line.startswith('"Ticker",') or line.startswith('Ticker,'):
                header_line_idx = i
                break
        
        if header_line_idx is None:
            print(f"⚠️ Could not find header line in {etf_ticker} CSV")
            return None
        
        # Parse CSV from header line using io.StringIO instead of pd.compat.StringIO
        csv_content = '\n'.join(lines[header_line_idx:])
        
        # Read CSV - FIXED: use io.StringIO
        df = pd.read_csv(io.StringIO(csv_content))
        
        # Clean up column names
        df.columns = df.columns.str.strip().str.replace('"', '')
        
        # Find weight column
        weight_col = None
        for col in ['Weight (%)', 'Weight %', 'Weight', 'weight_pct']:
            if col in df.columns:
                weight_col = col
                break
        
        # Find ticker column
        ticker_col = 'Ticker' if 'Ticker' in df.columns else None
        
        # Find name column
        name_col = 'Name' if 'Name' in df.columns else None
        
        if not ticker_col or not weight_col:
            print(f"⚠️ Missing required columns in {etf_ticker}")
            print(f"   Available columns: {list(df.columns)}")
            return None
        
        # Extract holdings
        holdings = []
        for _, row in df.iterrows():
            ticker = str(row[ticker_col]).strip()
            name = str(row[name_col]).strip() if name_col else ticker
            
            # Parse weight (handle comma as decimal separator)
            weight_str = str(row[weight_col]).replace(',', '.')
            try:
                weight = float(weight_str)
            except:
                weight = 0
            
            # Skip if weight is 0 or ticker is NaN
            if ticker == 'nan' or weight == 0:
                continue
            
            holdings.append({
                "etf": etf_ticker,
                "ticker": ticker,
                "name": name,
                "weight_pct": round(weight, 2)
            })
        
        print(f"   ✅ Loaded {len(holdings)} holdings from {etf_ticker}")
        return holdings
        
    except Exception as e:
        print(f"❌ Error fetching {etf_ticker}: {e}")
        return None

def save_holdings(holdings, etf_ticker):
    """Save holdings to CSV file"""
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    if not holdings:
        return
    
    df = pd.DataFrame(holdings)
    output_file = os.path.join(OUTPUT_DIR, f"{etf_ticker}_holdings.csv")
    df.to_csv(output_file, index=False)
    print(f"   💾 Saved to {output_file}")

def main():
    print("=" * 50)
    print("🔄 FETCHING ETF HOLDINGS")
    print("=" * 50)
    
    for etf_ticker, url in HOLDINGS_URLS.items():
        print(f"\n📈 Processing {etf_ticker}...")
        holdings = fetch_blackrock_csv(url, etf_ticker)
        if holdings:
            save_holdings(holdings, etf_ticker)
    
    print("\n" + "=" * 50)
    print("✅ Holdings fetch completed")
    print("=" * 50)

if __name__ == "__main__":
    main()