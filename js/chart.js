// Inisialisasi grafik
let priceChart;

function initChart() {
    const ctx = document.getElementById('price-chart').getContext('2d');
    
    priceChart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [{
                label: 'XAUTUSDT Price',
                borderColor: '#4285f4',
                backgroundColor: 'rgba(66, 133, 244, 0.1)',
                borderWidth: 2,
                pointRadius: 2,
                tension: 0.1
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
                        tooltipFormat: 'MMM dd, HH:mm'
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
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            }
        }
    });
    
    // Update grafik dengan data terbaru
    updateChart();
}

// Update data grafik
async function updateChart() {
    const historicalData = await loadHistoricalData();
    
    const chartData = historicalData.map(item => ({
        x: new Date(item.timestamp),
        y: item.price
    }));
    
    priceChart.data.datasets[0].data = chartData;
    priceChart.update();
    
    // Update grafik setiap 1 menit
    setTimeout(updateChart, 60000);
}

// Inisialisasi setelah halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('price-chart')) {
        initChart();
    }
});