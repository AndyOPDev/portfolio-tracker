import { getDisplayName, fmt } from '../utils.js';
import { DonutChart } from '../charts.js';
const { createElement: h } = React;

export function DistributionTab({ enriched, totalValue, cardFlatStyle, emptyCard }) {
  const chartData = enriched
    .filter(p => p.currentValue > 0)
    .map(p => ({
      name: getDisplayName(p.ticker),
      value: parseFloat(((p.currentValue / totalValue) * 100).toFixed(2)),
      ticker: p.ticker,
      color: p.color,
      currentValue: p.currentValue
    }))
    .sort((a, b) => b.value - a.value);

  if (chartData.length === 0) {
    return emptyCard("No data. Refresh to load.");
  }

  return h("div", { style: cardFlatStyle },
    // Donut Chart (sin cambios)
    h("div", { style: { position: "relative", height: 220, marginBottom: 32 } },
      h(DonutChart, {
        data: chartData.map(d => ({ name: d.name, value: d.value })),
        colors: chartData.map(d => d.color)
      })
    ),

    // === BARRAS HORIZONTALES CON TOOLTIP ===
    h("div", { style: { marginBottom: 24 } },
      h("div", { 
        style: { 
          fontSize: 14, 
          fontWeight: 600, 
          marginBottom: 18, 
          color: "#fff" 
        }
      }, "Distribution by Asset (%)"),

      chartData.map((item) =>
        h("div", {
          key: item.ticker,
          style: {
            marginBottom: 16,
            display: "flex",
            alignItems: "center",
            gap: 14,
            position: "relative",
            cursor: "pointer"
          },
          // Tooltip al hacer hover
          title: `${item.name}\n€${fmt(item.currentValue)}`,   // tooltip nativo simple
        },
          // Nombre del asset
          h("div", {
            style: {
              width: 155,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 13.5,
              fontWeight: 500,
              color: "#fff"
            }
          },
            h("div", {
              style: {
                width: 11,
                height: 11,
                borderRadius: 3,
                background: item.color,
                flexShrink: 0
              }
            }),
            item.name
          ),

          // Contenedor de la barra (100%)
          h("div", {
            style: {
              flex: 1,
              height: 26,
              background: "#3A3A3C",
              borderRadius: 9999,
              position: "relative",
              overflow: "hidden"
            }
          },
            h("div", {
              style: {
                position: "absolute",
                left: 0,
                top: 0,
                height: "100%",
                width: `${item.value}%`,
                background: item.color,
                borderRadius: 9999,
                transition: "width 0.5s ease"
              }
            })
          ),

          // Porcentaje a la derecha
          h("div", {
            style: {
              width: 62,
              textAlign: "right",
              fontSize: 14,
              fontWeight: 600,
              color: "#fff",
              flexShrink: 0
            }
          }, `${item.value.toFixed(1)}%`)
        )
      )
    )
  );
}