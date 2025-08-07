// Inisialisasi grafik
let priceChart;

function initChart() {
    const ctx = document.getElementById('price-chart').getContext('2d');
    
    priceChart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [{
                label: 'XAUTUSDT',
                borderColor: '#4285f4',
                backgroundColor: 'rgba(66, 133, 244, 0.1)',
                borderWidth: 2,
                pointRadius: 2,
                pointBackgroundColor: '#4285f4',
                tension: 0.1,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'hour',
                        tooltipFormat: 'MMM dd, HH:mm',
                        displayFormats: {
                            hour: 'MMM dd HH:mm'
                        }
                    },
                    title: {
                        display: true,
                        text: 'Waktu'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Harga (USD)'
                    },
                    ticks: {
                        callback: function(value) {
                            return '$' + value;
                        }
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
                    callbacks: {
                        label: function(context) {
                            return `$${context.parsed.y.toFixed(2)}`;
                        }
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
    
    // Update grafik dengan data terbaru
    updateChart(24);
}

// Update data grafik
async function updateChart(hours = 24) {
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
    
    // Update analisis setelah grafik diperbarui
    updatePriceAnalysis();
}

// Inisialisasi setelah halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('price-chart')) {
        initChart();
    }
});
