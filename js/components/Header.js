const { createElement: h } = React;

export function Header({ lastUpdate, loading, error, onRefresh }) {
  return h("div", { style: { padding: "24px 20px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" } },
    h("div", null,
      h("div", { style: { fontSize: 30, fontWeight: 700, letterSpacing: -0.5 } }, "Portfolio"),
      h("div", { style: { fontSize: 12, color: "#636366", marginTop: 3 } },
        lastUpdate ? "Updated " + lastUpdate.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
          : loading ? "Loading..." : error ? "Error loading data" : "No data"
      )
    ),
    h("button", {
      onClick: onRefresh, disabled: loading,
      style: { background: loading ? "#1C3A5E" : "#0A84FF", color: loading ? "#636366" : "#fff", border: "none", borderRadius: 20, padding: "8px 18px", fontSize: 14, fontWeight: 600 }
    }, loading ? "Loading..." : "↻ Refresh")
  );
}