import { COLORS } from './config.js';

const { createElement: h, useEffect, useRef } = React;

export function DonutChart({ data, colors }) {
  const ref = useRef();
  const chart = useRef();
  
  useEffect(() => {
    if (!ref.current) return;
    if (chart.current) chart.current.destroy();
    
    const chartColors = colors || data.map((_, i) => COLORS[i % COLORS.length]);
    
    chart.current = new Chart(ref.current, {
      type: "doughnut",
      data: {
        labels: data.map(d => d.name),
        datasets: [{ 
          data: data.map(d => d.value), 
          backgroundColor: chartColors,
          borderWidth: 0, 
          hoverOffset: 4 
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "65%",
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: c => c.label + ": " + c.parsed.toFixed(1) + "%" } }
        }
      }
    });
    return () => { if (chart.current) chart.current.destroy(); };
  }, [data, colors]);
  
  return h("canvas", { ref, style: { maxHeight: 200 } });
}

export function HorizontalBarChart({ data, colors }) {
  const ref = useRef();
  const chart = useRef();
  
  useEffect(() => {
    if (!ref.current) return;
    if (chart.current) chart.current.destroy();
    
    // Sort data from highest to lowest percentage
    const sortedData = [...data].sort((a, b) => b.value - a.value);
    const sortedColors = colors ? [...colors].sort((_, i, arr) => 
      sortedData.map(d => data.findIndex(item => item.name === d.name)).indexOf(i)
    ) : sortedData.map((_, i) => COLORS[i % COLORS.length]);
    
    chart.current = new Chart(ref.current, {
      type: "bar",
      data: {
        labels: sortedData.map(d => d.name),
        datasets: [{
          label: "Portfolio Allocation (%)",
          data: sortedData.map(d => d.value),
          backgroundColor: sortedColors,
          borderRadius: 6,
          borderSkipped: false,
          barPercentage: 0.7,
          categoryPercentage: 0.8
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { 
            callbacks: { 
              label: (context) => `${context.raw.toFixed(1)}% of portfolio`
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            max: 100,
            grid: { color: "#2C2C2E", lineWidth: 0.5 },
            title: { 
              display: true, 
              text: "Percentage (%)", 
              color: "#636366",
              font: { size: 11 }
            },
            ticks: {
              color: "#636366",
              callback: (value) => value + "%"
            }
          },
          y: {
            ticks: { 
              color: "#fff", 
              font: { size: 12, weight: "500" },
              padding: 8
            },
            grid: { display: false }
          }
        },
        layout: {
          padding: { right: 40 }
        }
      }
    });
    
    return () => { if (chart.current) chart.current.destroy(); };
  }, [data, colors]);
  
  const chartHeight = Math.max(300, data.length * 38);
  
  return h("div", { style: { position: "relative", width: "100%" } },
    h("canvas", { ref, style: { height: chartHeight, width: "100%" } })
  );
}