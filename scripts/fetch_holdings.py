import pandas as pd
import requests
import os
import io

# URLs de los holdings
HOLDINGS_URLS = {
    "XNAS": "https://www.blackrock.com/uk/individual/products/253741/fund/1472631233320.ajax?fileType=csv&fileName=CNDX_holdings&dataType=fund",
    "EMRG": "https://www.ishares.com/uk/professional/en/products/239637/ishares-msci-emerging-markets-etf/1506575576011.ajax?fileType=csv&fileName=EEM_holdings&dataType=fund",
    "VVSM": "https://www.vaneck.com/uk/en/investments/semiconductor-etf/downloads/holdings/"
}

OUTPUT_DIR = "data/holdings"


# ------------------------
# HELPERS
# ------------------------

def find_column(df, possible_names):
    for col in df.columns:
        if col.strip().lower() in [name.lower() for name in possible_names]:
            return col
    return None


def clean_value(value):
    if pd.isna(value):
        return ""
    value = str(value).strip()
    return "" if value.lower() == "nan" else value


def clean_ticker(raw_ticker):
    if pd.isna(raw_ticker):
        return ""
    return str(raw_ticker).strip().split()[0]


# Región simplificada
REGION_MAP = {
    "TSM": "Taiwan",

    "ASML": "Europe",
    "ASM": "Europe",
    "BESI": "Europe",
    "IFX": "Europe",
    "INF": "Europe",
    "STM": "Europe",
    "NXPI": "Europe",
    "MCHP": "Europe"
}


def classify_region(ticker):
    return REGION_MAP.get(ticker, "United States")


# ------------------------
# BLACKROCK CSV
# ------------------------

def fetch_blackrock_csv(url, etf_ticker):
    try:
        print(f"📊 Fetching {etf_ticker} holdings...")

        response = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'}, timeout=30)
        response.raise_for_status()

        content = response.text

        lines = content.strip().split('\n')
        header_line_idx = None

        for i, line in enumerate(lines):
            if "Ticker" in line and "Weight" in line:
                header_line_idx = i
                break

        if header_line_idx is None:
            print(f"⚠️ No header found in {etf_ticker}")
            return None

        csv_content = '\n'.join(lines[header_line_idx:])
        df = pd.read_csv(io.StringIO(csv_content))

        df.columns = df.columns.str.strip().str.replace('"', '')

        ticker_col = find_column(df, ["Ticker"])
        name_col = find_column(df, ["Name"])
        weight_col = find_column(df, ["Weight (%)", "Weight %", "Weight", "weight_pct"])
        sector_col = find_column(df, ["Sector"])
        location_col = find_column(df, ["Location", "Country"])

        if not ticker_col or not weight_col:
            print(f"⚠️ Missing required columns in {etf_ticker}")
            return None

        holdings = []

        for _, row in df.iterrows():
            ticker = clean_value(row[ticker_col])
            name = clean_value(row[name_col]) if name_col else ticker
            sector = clean_value(row[sector_col]) if sector_col else ""
            location = clean_value(row[location_col]) if location_col else ""

            weight_str = str(row[weight_col]).replace(',', '.')
            try:
                weight = float(weight_str)
            except:
                continue

            if not ticker or weight == 0:
                continue

            holdings.append({
                "etf": etf_ticker,
                "ticker": ticker,
                "name": name,
                "weight_pct": round(weight, 2),
                "sector": sector,
                "location": location
            })

        print(f"   ✅ Loaded {len(holdings)} holdings from {etf_ticker}")
        return holdings

    except Exception as e:
        print(f"❌ Error fetching {etf_ticker}: {e}")
        return None


# ------------------------
# VANECK XLSX
# ------------------------

def find_header_row(df):
    for i, row in df.iterrows():
        values = [str(v).lower() for v in row.values]
        if any("ticker" in v for v in values) and any("%" in v for v in values):
            return i
    return None


def fetch_vaneck_xlsx(url, etf_ticker):
    try:
        print(f"📊 Fetching {etf_ticker} holdings (VanEck)...")

        response = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'}, timeout=30)
        response.raise_for_status()

        raw_df = pd.read_excel(io.BytesIO(response.content), header=None)

        header_row = find_header_row(raw_df)
        if header_row is None:
            print("❌ Header not found in XLSX")
            return None

        df = pd.read_excel(io.BytesIO(response.content), skiprows=header_row)
        df.columns = df.columns.str.strip()

        def find_col(possible):
            return next((c for c in df.columns if any(p in c.lower() for p in possible)), None)

        ticker_col = find_col(["ticker", "symbol"])
        name_col = find_col(["name"])
        weight_col = find_col(["%", "weight"])

        if not ticker_col or not weight_col:
            print("⚠️ Missing required columns in VVSM")
            return None

        holdings = []

        for _, row in df.iterrows():
            ticker = clean_ticker(row[ticker_col])

            if not ticker:
                continue

            name = clean_value(row[name_col]) if name_col else ticker

            try:
                weight = float(str(row[weight_col]).replace('%', '').replace(',', '.'))
            except:
                continue

            if weight == 0:
                continue

            holdings.append({
                "etf": etf_ticker,
                "ticker": ticker,
                "name": name,
                "weight_pct": round(weight, 2),
                "sector": "Information Technology",
                "location": classify_region(ticker)
            })

        print(f"   ✅ Loaded {len(holdings)} holdings from {etf_ticker}")
        return holdings

    except Exception as e:
        print(f"❌ Error fetching {etf_ticker}: {e}")
        return None


# ------------------------
# SAVE
# ------------------------

def save_holdings(holdings, etf_ticker):
    if not holdings:
        return

    os.makedirs(OUTPUT_DIR, exist_ok=True)

    df = pd.DataFrame(holdings)
    df = df.sort_values(by="weight_pct", ascending=False)

    output_file = os.path.join(OUTPUT_DIR, f"{etf_ticker}_holdings.csv")
    df.to_csv(output_file, index=False)

    print(f"   💾 Saved to {output_file}")


# ------------------------
# MAIN
# ------------------------

def main():
    print("=" * 50)
    print("🔄 FETCHING ETF HOLDINGS")
    print("=" * 50)

    for etf_ticker, url in HOLDINGS_URLS.items():
        print(f"\n📈 Processing {etf_ticker}...")

        if etf_ticker == "VVSM":
            holdings = fetch_vaneck_xlsx(url, etf_ticker)
        else:
            holdings = fetch_blackrock_csv(url, etf_ticker)

        if holdings:
            save_holdings(holdings, etf_ticker)

    print("\n" + "=" * 50)
    print("✅ Holdings fetch completed")
    print("=" * 50)


if __name__ == "__main__":
    main()