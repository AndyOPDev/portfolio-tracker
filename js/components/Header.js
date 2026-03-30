const { createElement: h } = React;

export function Header({ livePricesLoading, livePricesError }) {
  return h("div", { style: { padding: "16px 20px 8px 20px", display: "flex", alignItems: "center", justifyContent: "flex-end" } },
    (livePricesLoading || livePricesError) && h("div", { 
      style: { 
        marginRight: 12, 
        fontSize: 11, 
        color: livePricesError ? "#FF375F" : "#FF9F0A",
        fontFamily: "monospace"
      } 
    }, 
      livePricesLoading ? "⟳ Updating..." : "⚠️ Using daily prices"
    )
  );
}