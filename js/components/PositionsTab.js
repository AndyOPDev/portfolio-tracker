import { getDisplayName, fmt } from '../utils.js';

const { createElement: h } = React;

export function PositionsTab({ enriched, cardStyle, rowStyle, emptyCard }) {
  if (enriched.length === 0) {
    return emptyCard("No positions calculated yet.");
  }

  return h("div", { style: cardStyle },
    enriched.map((p, i) =>
      h("div", { key: p.ticker, style: rowStyle(i < enriched.length - 1) },
        h("div", { style: { width: 36, height: 36, borderRadius: 10, background: p.color + "22", display: "flex", alignItems: "center", justifyContent: "center", marginRight: 12, flexShrink: 0 } },
          h("span", { style: { fontSize: 11, fontWeight: 700, color: p.color } }, p.ticker.slice(0, 4))
        ),
        h("div", { style: { flex: 1 } },
          h("div", { style: { fontSize: 15, fontWeight: 600 } }, getDisplayName(p.ticker)),
          h("div", { style: { fontSize: 12, color: "#636366" } }, fmt(p.units, 6) + " units")
        ),
        h("div", { style: { textAlign: "right" } },
          h("div", { style: { fontSize: 14, fontWeight: 600 } }, "avg €" + fmt(p.avgPrice)),
          h("div", { style: { fontSize: 12, color: "#636366" } }, "invested €" + fmt(p.totalInvested))
        )
      )
    )
  );
}