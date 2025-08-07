// chart.js - Updated for CoinGecko
let priceChart;

async function initChart() {
  const ctx = document.getElementById('price-chart').getContext('2d');
  
  // Load initial data
  const initialData = await loadHistoricalData(24);
  const chartData = initialData.map(item => ({
    x: item.timestamp,
    y: item.price
  }));
  
  priceChart = new Chart(ctx, {
    type: 'line',
    data: {
      datasets: [{
        label: 'XAUT/USDT',
        data: chartData,
        borderColor: '#4285f4',
        backgroundColor: 'rgba(66, 133, 244, 0.1)',
        borderWidth: 3,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointBackgroundColor: '#4285f4',
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: 'index',
      },
      scales: {
        x: {
          type: 'time',
          time: {
            tooltipFormat: 'MMM dd, HH:mm',
            displayFormats: {
              hour: 'HH:mm',
              day: 'MMM dd'
            }
          },
          title: {
            display: true,
            text: 'Waktu',
            font: {
              size: 14,
              weight: 'bold'
            }
          },
          grid: {
            display: false
          }
        },
        y: {
          title: {
            display: true,
            text: 'Harga (USD)',
            font: {
              size: 14,
              weight: 'bold'
            }
          },
          ticks: {
            callback: function(value) {
              return '$' + value;
            }
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          }
        }
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          titleColor: '#333',
          bodyColor: '#666',
          borderColor: '#eee',
          borderWidth: 1,
          padding: 12,
          callbacks: {
            label: function(context) {
              return `$${context.parsed.y.toFixed(2)}`;
            },
            title: function(context) {
              return new Date(context[0].parsed.x).toLocaleString();
            }
          }
        }
      },
      elements: {
        line: {
          borderJoinStyle: 'round'
        }
      }
    }
  });
}

// Update data grafik
async function updateChart(hours = 24) {
  if (!priceChart) return;
  
  const historicalData = await loadHistoricalData(hours);
  const chartData = historicalData.map(item => ({
    x: item.timestamp,
    y: item.price
  }));
  
  priceChart.data.datasets[0].data = chartData;
  
  // Update unit waktu berdasarkan range
  const timeUnit = hours <= 72 ? 'hour' : 'day';
  priceChart.options.scales.x.time.unit = timeUnit;
  
  priceChart.update();
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('price-chart')) {
    initChart();
  }
});
