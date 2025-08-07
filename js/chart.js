let priceChart;

function initPriceChart() {
    const ctx = document.getElementById('price-chart').getContext('2d');
    priceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'XAUT/USDT',
                data: [],
                borderColor: '#f9a825',
                backgroundColor: 'rgba(249, 168, 37, 0.1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (context) => `$${context.parsed.y.toFixed(2)}`
                    }
                }
            }
        }
    });
}

function updateChartWithNewPrice(price) {
    const now = new Date();
    const label = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    priceChart.data.labels.push(label);
    priceChart.data.datasets[0].data.push(price);
    
    if (priceChart.data.labels.length > 24) {
        priceChart.data.labels.shift();
        priceChart.data.datasets[0].data.shift();
    }
    
    priceChart.update();
}

if (document.getElementById('price-chart')) {
    initPriceChart();
}
