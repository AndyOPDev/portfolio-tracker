import { COLORS } from './config.js';
import { fmt } from './utils.js';

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
          borderWidth: 2,
          borderColor: "#000",
          hoverOffset: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        cutout: "60%",
        plugins: {
          legend: { display: false },
          tooltip: { 
            callbacks: { 
              title: (tooltipItems) => {
                const index = tooltipItems[0].dataIndex;
                return data[index]?.name || "";
              },
              label: (tooltipItem) => {
                const index = tooltipItem.dataIndex;
                const item = data[index];
                if (!item) return "";
                const value = tooltipItem.raw;
                const currentValue = item.currentValue;
                return [
                  `€${fmt(currentValue)}`,
                  `${value.toFixed(1)}%`
                ];
              }
            },
            bodyAlign: "left",
            titleAlign: "center"
          }
        }
      }
    });
    
    return () => { if (chart.current) chart.current.destroy(); };
  }, [data, colors]);
  
  return h("canvas", { ref, style: { width: "100%", height: "100%" } });
}

export function HorizontalBarChart({ data, colors }) {
  const ref = useRef();
  const chart = useRef();
  
  useEffect(() => {
    if (!ref.current) return;
    if (chart.current) chart.current.destroy();
    
    const sortedData = [...data].sort((a, b) => b.value - a.value);
    const sortedColors = colors ? 
      sortedData.map((item, idx) => {
        const originalIndex = data.findIndex(d => d.name === item.name);
        return colors[originalIndex];
      }) : 
      sortedData.map((_, i) => COLORS[i % COLORS.length]);
    
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
              label: (context) => `${context.raw.toFixed(1)}%`
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
  
  return h("canvas", { ref, style: { height: chartHeight, width: "100%" } });
}