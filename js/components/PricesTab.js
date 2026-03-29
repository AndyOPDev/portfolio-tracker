import { getDisplayName, fmt, pct } from '../utils.js';

const { createElement: h } = React;

export function PricesTab({ enriched, lastUpdate, cardStyle, rowStyle, emptyCard }) {
  if (enriched.length === 0) {
    return emptyCard("No data.");
  }

  return h("div", { style: cardStyle },
    h("div", { style: { padding: "12px 0", borderBottom: "0.5px solid #2C2C2E", display: "flex", fontWeight: 600, color: "#636366", fontSize: 12 } },
      h("div", { style: { flex: 2 } }, "Asset"),
      h("div", { style: { flex: 1, textAlign: "right" } }, "Price"),
      h("div", { style: { flex: 1, textAlign: "right" } }, "Return %"),
      h("div", { style: { flex: 1, textAlign: "right" } }, "Last update")
    ),
    enriched.map((p, i) =>
      h("div", { key: p.ticker, style: rowStyle(i < enriched.length - 1) },
        h("div", { style: { flex: 2 } },
          h("div", { style: { fontWeight: 600 } }, getDisplayName(p.ticker)),
          h("div", { style: { fontSize: 11, color: "#636366" } }, p.ticker)
        ),
        h("div", { style: { flex: 1, textAlign: "right", fontWeight: 500 } },
          p.currentPrice > 0 ? `€${p.currentPrice.toFixed(2)}` : "—"
        ),
        h("div", { style: { flex: 1, textAlign: "right", color: p.plPct >= 0 ? "#30D158" : "#FF375F" } },
          p.currentPrice > 0 ? pct(p.plPct) : "—"
        ),
        h("div", { style: { flex: 1, textAlign: "right", fontSize: 11, color: "#636366" } },
          lastUpdate ? new Date(lastUpdate).toLocaleTimeString() : "—"
        )
      )
    )
  );
}