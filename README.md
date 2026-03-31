# portfolio-tracker
# Portfolio Tracker

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-Active-brightgreen)](https://github.com/AndyOPDev/portfolio-tracker/actions)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-orange)](https://workers.cloudflare.com/)

> A personal portfolio tracker with real-time prices for cryptocurrencies and daily updates for ETFs. Built with React, GitHub Actions, and Cloudflare Workers.

## Features

- Real-time prices for Bitcoin (via Kraken API)
- 30-minute updates for ETFs (XNAS, VVSM)
- Daily portfolio calculations (P&L, allocation, underlying holdings)
- Responsive design (works on desktop and mobile)
- Interactive charts (donut and horizontal bar charts)
- Sortable tables with filtering (hide holdings below 0.25%)
- Automatic data refresh via GitHub Actions
- Cached responses to respect API rate limits

## Architecture

The system uses:
- GitHub Actions for scheduled data refresh (prices every 30 min, movements daily)
- Cloudflare Worker as a proxy for real-time prices (BTC from Kraken, ETFs from Yahoo)
- GitHub Pages to host the React app
- Google Sheets as the source for movement data (CSV export)

## Live Demo

Visit: https://andyopdev.github.io/portfolio-tracker/

Note: This is a personal portfolio tracker, so you'll see my assets. But you can use this as a template for your own!

## Tech Stack

- React 18: Frontend framework (CDN, no build)
- Chart.js: Donut and bar charts
- GitHub Actions: Automated data refresh
- Cloudflare Workers: Real-time price proxy
- Yahoo Finance: ETF price source
- Kraken API: Bitcoin price source
- Google Sheets: Movement input (CSV export)

## How to Use as a Template

This project is highly personalized for my portfolio, but you can easily adapt it for your own assets.

### Step 1: Fork the Repository

git clone https://github.com/AndyOPDev/portfolio-tracker.git
cd portfolio-tracker

### Step 2: Configure Your Movements

1. Create a Google Sheet with your transactions in this format:
   Columns: ticker, way, baseAmt, quoteAmt, feeAmt, feeCur, date
   Example: AAPL, BUY, 10, 1750.00, 1.50, EUR, 2024-01-15

2. Publish the sheet as CSV:
   File -> Share -> Publish to web
   Select the sheet and format "CSV"
   Copy the generated URL

3. Update scripts/fetch_movements.py with your URL:
   MOVEMENTS_URL = "https://docs.google.com/spreadsheets/d/e/YOUR_ID/pub?output=csv"

### Step 3: Configure Your Tickers

Edit js/config.js to add your tickers:

export const TICKER_NAMES = {
  "YOUR_TICKER": "Your Display Name",
};

export const TICKER_COLORS = {
  "YOUR_TICKER": "#0A84FF",
};

### Step 4: Update Price Sources

Edit the Cloudflare Worker to include your tickers:

const baseSymbols = {
  "XNAS": "XNAS",
  "VVSM": "VVSM",
  "YOUR_TICKER": "SYMBOL_BASE",
};

### Step 5: Deploy to GitHub Pages

git add .
git commit -m "My portfolio tracker"
git push origin main

Then enable GitHub Pages:
- Go to Settings -> Pages
- Source: "Deploy from branch"
- Branch: main -> / (root)
- Click Save

Your app will be available at: https://YOUR_USERNAME.github.io/portfolio-tracker/

## Data Structure

movements.json:

{
  "movements": [
    {
      "ticker": "XNAS",
      "way": "BUY",
      "baseAmt": 10,
      "quoteAmt": 468.60,
      "feeAmt": 1.50,
      "feeCur": "EUR",
      "date": "2025-06-02"
    }
  ]
}

prices.json:

{
  "precios": [
    { "ticker": "XNAS", "precio": 46.86, "moneda": "EUR" }
  ]
}

underlying.json:

{
  "underlying": [
    {
      "ticker": "AAPL",
      "name": "Apple Inc",
      "value": 1234.56,
      "pct": 12.3,
      "sector": "Technology",
      "location": "USA"
    }
  ],
  "total_value": 9876.54
}

## GitHub Actions Workflows

- refresh_prices.yml: Every 30 minutes, updates prices.json (ETFs)
- daily_refresh.yml: Daily at 3:00 AM, updates movements.json, underlying.json, and ETF holdings

## Cloudflare Worker

The worker handles real-time price fetching:
- BTC: Kraken API (real-time, no cache)
- XNAS, VVSM: Yahoo Finance with 5-minute cache
- Smart suffix selection: .DE during core hours (9-17:30 CET), .DU during extended hours

## Responsive Design

- Desktop: Full table view with all columns
- Mobile: Card-based layout with essential information

## Customization

### Colors

Edit js/config.js:

export const TICKER_COLORS = {
  "XNAS": "#0A84FF",
  "VVSM": "#30D158",
  "BTC": "#FF9F0A",
};

### Filters

In UnderlyingTab.js, adjust the minimum percentage:

const MIN_PERCENTAGE = 0.25; // Change to 0.5, 1.0, etc.

## Troubleshooting

### Prices not updating?
- Check GitHub Actions logs for errors
- Verify the Cloudflare Worker is running
- Check if Yahoo Finance is rate-limiting (wait 15-60 min)

### Movements not loading?
- Ensure Google Sheet is published as CSV
- Verify the URL in fetch_movements.py is correct
- Check if the sheet structure matches the expected format

### Underlying data missing?
- Run python scripts/calculate_underlying.py locally
- Check if ETF holdings files exist in data/holdings/

## License

MIT (c) Andy Hernández Salazar

## Acknowledgments

- Yahoo Finance for ETF data
- Kraken for Bitcoin prices
- Cloudflare for the worker proxy
- Chart.js for beautiful charts
- React for the UI

Built with love for portfolio tracking