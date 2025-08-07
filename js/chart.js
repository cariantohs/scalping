let priceChart;

// Fungsi untuk menginisialisasi grafik harga
function initPriceChart() {
    const ctx = document.getElementById('price-chart').getContext('2d');
    
    priceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Harga XAUT/USDT',
                data: [],
                borderColor: '#f9a825',
                backgroundColor: 'rgba(249, 168, 37, 0.1)',
                borderWidth: 3,
                pointRadius: 0,
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
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
            scales: {
                x: {
                    grid: {
                        display: false,
                        drawBorder: false
                    },
                    ticks: {
                        color: '#aaa'
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#aaa',
                        callback: function(value) {
                            return '$' + value;
                        }
                    }
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            }
        }
    });
    
    // Muat data awal
    loadInitialChartData();
}

// Fungsi untuk memuat data awal grafik
async function loadInitialChartData() {
    try {
        const user = JSON.parse(localStorage.getItem('crypto_user'));
        if (!user) return;
        
        // Ambil data 24 jam terakhir
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 1);
        
        const snapshot = await db.collection("priceHistory")
            .where("userId", "==", user.uid)
            .where("symbol", "==", "XAUTUSDT")
            .where("timestamp", ">=", startDate)
            .orderBy("timestamp", "asc")
            .get();
        
        const prices = [];
        const timestamps = [];
        
        snapshot.forEach(doc => {
            const data = doc.data();
            prices.push(data.price);
            timestamps.push(data.timestamp.toDate());
        });
        
        // Format label waktu
        const labels = timestamps.map(time => {
            return `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;
        });
        
        // Perbarui grafik
        priceChart.data.labels = labels;
        priceChart.data.datasets[0].data = prices;
        priceChart.update();
        
    } catch (error) {
        console.error('Error loading chart data:', error);
    }
}

// Fungsi untuk memperbarui grafik dengan harga baru
function updateChartWithNewPrice(price) {
    const now = new Date();
    const timeLabel = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    // Tambahkan data baru
    priceChart.data.labels.push(timeLabel);
    priceChart.data.datasets[0].data.push(price);
    
    // Pertahankan hanya 24 data terbaru
    if (priceChart.data.labels.length > 24) {
        priceChart.data.labels.shift();
        priceChart.data.datasets[0].data.shift();
    }
    
    // Perbarui grafik
    priceChart.update();
}

// Inisialisasi grafik saat dashboard dimuat
if (window.location.pathname.endsWith("dashboard.html")) {
    document.addEventListener("DOMContentLoaded", initPriceChart);
}
