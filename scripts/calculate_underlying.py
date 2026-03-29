import json
import pandas as pd
import os
from datetime import datetime

# ------------------------
# NORMALIZACIÓN
# ------------------------
TICKER_NORMALIZATION = {
    "2330": "TSM",
    "005930": "SMSN",
    "000660": "HYNIX",
    "700": "TENCENT",
    "9988": "ALIBABA"
}

ETF_NORMALIZATION = {
    "IE00BYWYCC39": "EMRG"   # Emerging Markets ETF
}

SECTOR_MAP = {
    "Information Technology": "Information Technology",
    "Consumer Discretionary": "Consumer Discretionary",
    "Consumer Staples": "Consumer Staples",
    "Financials": "Financials",
    "Industrials": "Industrials",
    "Utilities": "Utilities",
    "Energy": "Energy",
    "Real Estate": "Real Estate",
    "Materials": "Materials",
    "Communication": "Communication",
    "Crypto": "Global",
    "Biotechnology": "Health Care",
    "Pharmaceuticals": "Health Care",
    "Health Care": "Health Care",
    "Healthcare": "Health Care",
    "CASH": "Cash" 
    # añade cualquier variante que aparezca
}

SECTOR_MAP.update({
    "Telecommunications": "Communication",
    "Internet": "Communication",
    "Life Sciences": "Health Care",
    "Medical": "Health Care",
    "Biopharma": "Health Care",
    "Cash(COMMITTED)": "Cash",
    "Cash": "Cash",
    "CASH": "Cash",
    "USD": "Cash",
    "EUR": "Cash",
    "Cash and/or Derivatives": "Cash"
})

REGION_MAP = {
    # Grandes clusters
    "United States": "United States",
    "US": "United States",
    
    "China": "China",
    "Hong Kong": "China",
    "Taiwan": "Taiwan",
    
    "Korea": "Korea",
    "South Korea": "Korea",
    "Korea (South)": "Korea",
    
    "India": "India",
    
    # Europa, incluyendo España, Polonia, Grecia, Czech Republic, Hungary
    "Europe": "Europe",
    "Spain": "Europe",
    "Poland": "Europe",
    "Czech Republic": "Europe",
    "Greece": "Europe",
    "Hungary": "Europe",
    "Netherlands": "Europe",
    "Turkey": "Europe",
    
    # América Latina
    "Brazil": "Latin America",
    "Mexico": "Latin America",
    "Chile": "Latin America",
    "Peru": "Latin America",
    "Colombia": "Latin America",
    
    "Canada": "Canada",
    
    # Oriente Medio / Middle East
    "Saudi Arabia": "Middle East",
    "United Arab Emirates": "Middle East",
    "Qatar": "Middle East",
    "Kuwait": "Middle East",
    
    # Asia / resto de Asia (Malasia, Indonesia, Thailand, Philippines)
    "Malaysia": "Asia",
    "Indonesia": "Asia",
    "Thailand": "Asia",
    "Philippines": "Asia",
    
    # África (solo South Africa)
    "South Africa": "Africa",
    "Egypt":"Africa",

    "United Kingdom": "United Kingdom",
    "UK": "United Kingdom",
    # Otros o desconocidos
    "Global": "Global",
    "Other": "Other"
}

def normalize_ticker(t):
    t = str(t).strip().upper()
    return TICKER_NORMALIZATION.get(t, t)

def normalize_etf(t):
    t = str(t).strip().upper()
    return ETF_NORMALIZATION.get(t, t)

# ------------------------
# MAIN
# ------------------------
def calculate_underlying():
    print("\n🚀 START CALCULATION\n")

    # ------------------------
    # LOAD DATA
    # ------------------------
    with open("data/movements.json") as f:
        movs = json.load(f)
    with open("data/prices.json") as f:
        prices = json.load(f)

    # ------------------------
    # POSITIONS
    # ------------------------
    positions = {}
    for m in movs.get("movements", []):
        if m["way"] != "BUY":
            continue
        t = normalize_etf(m["ticker"])
        if t not in positions:
            positions[t] = {"units": 0, "invested": 0}
        positions[t]["units"] += m["baseAmt"]
        positions[t]["invested"] += m["quoteAmt"]

    print("📊 ETFs en cartera:", list(positions.keys()))

    # ------------------------
    # PRICES
    # ------------------------
    price_map = {normalize_etf(p["ticker"]): float(p["precio"]) for p in prices.get("precios", [])}
    etf_values = {t: price_map.get(t, 0) * pos["units"] for t, pos in positions.items()}
    total_value = sum(etf_values.values())
    print("💰 Valor por ETF:", etf_values)
    print("💼 Total cartera:", round(total_value, 2))

    # ------------------------
    # LOAD HOLDINGS
    # ------------------------
    holdings = []
    holdings_dir = "data/holdings"
    for file in os.listdir(holdings_dir):
        if not file.endswith(".csv"):
            continue
        path = os.path.join(holdings_dir, file)
        df = pd.read_csv(path)
        if "ticker" not in df.columns or "weight_pct" not in df.columns:
            print(f"⚠ Skipping {file} (bad format)")
            continue
        df["etf"] = normalize_etf(file.replace("_holdings.csv", ""))
        df["ticker"] = df["ticker"].apply(normalize_ticker)
        holdings.append(df)
    holdings_df = pd.concat(holdings, ignore_index=True)
    print("\n📂 ETFs en CSV:", holdings_df["etf"].unique())

    missing_etfs = set(holdings_df["etf"]) - set(etf_values.keys())
    if missing_etfs:
        print("❌ ETFs ignorados:", missing_etfs)
    else:
        print("✅ Todos los ETFs están siendo usados")

    # ------------------------
    # CALCULO UNDERLYING
    # ------------------------
    underlying = {}
    for _, row in holdings_df.iterrows():
        etf = normalize_etf(row["etf"])
        ticker = row["ticker"]
        if ticker == "--":
            continue
        if etf not in etf_values:
            continue

        weight = float(row["weight_pct"]) / 100
        value = etf_values[etf] * weight

        if ticker not in underlying:
            underlying[ticker] = {
                "ticker": ticker,
                "name": row.get("name", ticker),
                "value": 0,
                "sector": SECTOR_MAP.get(row.get("sector", "Unknown"), "Unknown"),
                "location": REGION_MAP.get(row.get("location", "Unknown"), "Other")
            }
        underlying[ticker]["value"] += value

        # DEBUG TSM
        if ticker == "TSM":
            print(f"🧠 TSM contribution → ETF: {etf}, weight: {weight:.4f}, value: {value:.2f}")

    # ------------------------
    # ADD DIRECT ASSETS (BTC)
    # ------------------------
    if "BTC" in etf_values:
        underlying["BTC"] = {
            "ticker": "BTC",
            "name": "Bitcoin",
            "value": etf_values["BTC"],
            "sector": "Crypto",
            "location": "Global"
        }

    # ------------------------
    # DEBUG: holdings Unknown
    # ------------------------
    unknown_sector = [v for v in underlying.values() if v["sector"] == "Unknown"]
    unknown_location = [v for v in underlying.values() if v["location"] in ["Other", "Unknown"]]

    if unknown_sector:
        print(f"⚠ {len(unknown_sector)} holdings con sector Unknown")
        for h in unknown_sector:
            print(h["ticker"], h.get("name", ""), h.get("sector", ""), h.get("location", ""))

    if unknown_location:
        print(f"⚠ {len(unknown_location)} holdings con location Unknown/Other")
        for h in unknown_location:
            print(h["ticker"], h.get("name", ""), h.get("sector", ""), h.get("location", ""))

    # ------------------------
    # OUTPUT JSON
    # ------------------------
    result = []
    for t, d in underlying.items():
        pct = (d["value"] / total_value) * 100 if total_value else 0
        result.append({
            "ticker": t,
            "name": d["name"],
            "value": round(d["value"], 2),
            "pct": round(pct, 2),
            "sector": d["sector"],
            "location": d["location"]
        })
    result.sort(key=lambda x: x["value"], reverse=True)

    print("\n📊 TOP 10:")
    for r in result[:10]:
        print(r)

    tsm = next((x for x in result if x["ticker"] == "TSM"), None)
    print("\n🔍 TSM FINAL:", tsm)

    with open("data/underlying.json", "w", encoding="utf-8") as f:
        json.dump({
            "underlying": result,
            "total_value": round(total_value,2),
            "updated": datetime.now().isoformat()
        }, f, indent=2)

    print(f"\n✅ TOTAL POSICIONES: {len(result)}")

# ------------------------
# RUN
# ------------------------
if __name__ == "__main__":
    calculate_underlying()