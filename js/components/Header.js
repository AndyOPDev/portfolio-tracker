const { createElement: h } = React;

export function Header({ lastGitHubUpdate, loading, error, onRefresh, hasNewData }) {
  return h("div", { style: { padding: "16px 20px 8px 20px", display: "flex", alignItems: "center", justifyContent: "flex-end" } },
    hasNewData && h("button", {
      onClick: onRefresh,
      style: { 
        background: "#FF9F0A", 
        color: "#fff", 
        border: "none", 
        borderRadius: 20, 
        padding: "6px 14px", 
        fontSize: 13, 
        fontWeight: 600,
        cursor: "pointer"
      }
    }, "✨ New data available")
  );
}