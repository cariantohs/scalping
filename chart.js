// Global variables
let chart;
let currentChartType = 'line';
let currentTimeframe = '24h';
let priceData = [];
let candlestickData = [];
const symbol = 'XAUTUSDT';

// DOM Elements
const lineChartBtn = document.getElementById('line-chart-btn');
const candlestickChartBtn = document.getElementById('candlestick-chart-btn');
const timeframeSelect = document.getElementById('timeframe-select');

// Initialize chart
function initChart() {
    // Load data from Firebase
    loadData();
    
    // Setup event listeners
    lineChartBtn.addEventListener('click', () => switchChartType('line'));
    candlestickChartBtn.addEventListener('click', () => switchChartType('candlestick'));
    timeframeSelect.addEventListener('change', (e) => {
        currentTimeframe = e.target.value;
        loadData();
    });
    
    // Start real-time listener
    startRealTimeListener();
}

// Switch between chart types
function switchChartType(type) {
    currentChartType = type;
    
    if (type === 'line') {
        lineChartBtn.classList.add('active');
        candlestickChartBtn.classList.remove('active');
    } else {
        candlestickChartBtn.classList.add('active');
        lineChartBtn.classList.remove('active');
    }
    
    renderChart();
}

// Load data from Firebase
function loadData() {
    // Calculate time range based on timeframe
    const now = new Date();
    let startTime;
    
    switch(currentTimeframe) {
        case '1h':
            startTime = new Date(now.getTime() - 60 * 60 * 1000);
            break;
        case '4h':
            startTime = new Date(now.getTime() - 4 * 60 * 60 * 1000);
            break;
        case '24h':
            startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            break;
        case '7d':
            startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
        default:
            startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }
    
    // Fetch data from Firestore
    firebase.firestore().collection('prices')
        .where('symbol', '==', symbol)
        .where('timestamp', '>=', startTime)
        .orderBy('timestamp', 'asc')
        .get()
        .then(querySnapshot => {
            priceData = [];
            candlestickData = [];
            const rawData = [];
            
            querySnapshot.forEach(doc => {
                const data = doc.data();
                const timestamp = data.timestamp.toDate();
                
                // For line chart
                rawData.push({
                    x: timestamp,
                    y: data.price,
                    high: data.high_24h,
                    low: data.low_24h,
                    change: data.price_change_percentage_24h
                });
            });
            
            // Process data for charts
            if (rawData.length > 0) {
                // For line chart
                priceData = rawData.map(d => ({ x: d.x, y: d.y }));
                
                // For candlestick chart
                candlestickData = createCandlestickData(rawData);
                
                // Update current price display
                const latestPrice = rawData[rawData.length - 1].y;
                const priceChange = rawData[rawData.length - 1].change;
                
                document.getElementById('current-price').textContent = `$${latestPrice.toFixed(2)}`;
                document.getElementById('price-change').textContent = `${priceChange.toFixed(2)}%`;
                document.getElementById('price-change').className = priceChange >= 0 ? 'change positive' : 'change negative';
            }
            
            // Perform technical analysis
            performTechnicalAnalysis();
            
            // Render chart
            renderChart();
        })
        .catch(error => {
            console.error("Error loading data: ", error);
        });
}

// Create candlestick data from raw data
function createCandlestickData(rawData) {
    const candlesticks = [];
    
    // Group data by time intervals
    const groupedData = groupDataByInterval(rawData, currentTimeframe);
    
    // Create candlestick for each group
    for (const group of groupedData) {
        if (group.length === 0) continue;
        
        const open = group[0].y;
        const close = group[group.length - 1].y;
        let high = -Infinity;
        let low = Infinity;
        let timestamp = group[0].x;
        
        for (const item of group) {
            if (item.y > high) high = item.y;
            if (item.y < low) low = item.y;
        }
        
        candlesticks.push({
            x: timestamp,
            o: open,
            h: high,
            l: low,
            c: close
        });
    }
    
    return candlesticks;
}

// Group data by selected timeframe
function groupDataByInterval(data, timeframe) {
    const grouped = [];
    let currentGroup = [];
    let groupInterval;
    
    switch(timeframe) {
        case '1h':
            groupInterval = 60 * 60 * 1000; // 1 hour
            break;
        case '4h':
            groupInterval = 4 * 60 * 60 * 1000; // 4 hours
            break;
        case '24h':
            groupInterval = 24 * 60 * 60 * 1000; // 24 hours
            break;
        case '7d':
            groupInterval = 7 * 24 * 60 * 60 * 1000; // 7 days
            break;
        default:
            groupInterval = 24 * 60 * 60 * 1000;
    }
    
    if (data.length === 0) return grouped;
    
    let currentIntervalStart = data[0].x.getTime();
    let currentIntervalEnd = currentIntervalStart + groupInterval;
    
    for (const item of data) {
        const timestamp = item.x.getTime();
        
        if (timestamp >= currentIntervalStart && timestamp < currentIntervalEnd) {
            currentGroup.push(item);
        } else {
            grouped.push(currentGroup);
            currentGroup = [item];
            
            // Move to next interval
            currentIntervalStart = currentIntervalEnd;
            currentIntervalEnd = currentIntervalStart + groupInterval;
        }
    }
    
    // Add last group
    if (currentGroup.length > 0) {
        grouped.push(currentGroup);
    }
    
    return grouped;
}

// Render the chart based on current settings
function renderChart() {
    const ctx = document.getElementById('price-chart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (chart) {
        chart.destroy();
    }
    
    if (currentChartType === 'line') {
        chart = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [{
                    label: 'XAUT/USDT Price',
                    data: priceData,
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1,
                    fill: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: getTimeUnit(),
                            tooltipFormat: 'dd MMM yyyy HH:mm'
                        },
                        title: {
                            display: true,
                            text: 'Waktu'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Harga (USDT)'
                        }
                    }
                }
            }
        });
    } else {
        chart = new Chart(ctx, {
            type: 'candlestick',
            data: {
                datasets: [{
                    label: 'XAUT/USDT',
                    data: candlestickData
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: getTimeUnit(),
                            tooltipFormat: 'dd MMM yyyy HH:mm'
                        }
                    },
                    y: {
                        ticks: {
                            callback: function(value) {
                                return '$' + value;
                            }
                        }
                    }
                }
            }
        });
    }
}

// Get appropriate time unit based on timeframe
function getTimeUnit() {
    switch(currentTimeframe) {
        case '1h': return 'minute';
        case '4h': return 'hour';
        case '24h': return 'hour';
        case '7d': return 'day';
        default: return 'hour';
    }
}

// Perform technical analysis
function performTechnicalAnalysis() {
    if (priceData.length < 50) return;
    
    // Extract closing prices
    const closingPrices = priceData.map(p => p.y);
    
    // Calculate moving averages
    const ma50 = calculateMA(closingPrices, 50);
    const ma200 = calculateMA(closingPrices, 200);
    
    // Calculate RSI
    const rsi = calculateRSI(closingPrices, 14);
    
    // Update UI
    document.getElementById('ma-50').textContent = `$${ma50.toFixed(2)}`;
    document.getElementById('ma-200').textContent = `$${ma200.toFixed(2)}`;
    document.getElementById('rsi').textContent = rsi.toFixed(2);
    
    // MA Analysis
    const currentPrice = closingPrices[closingPrices.length - 1];
    const ma50Analysis = currentPrice > ma50 ? "Harga di atas MA50 (Bullish)" : "Harga di bawah MA50 (Bearish)";
    const ma200Analysis = currentPrice > ma200 ? "Harga di atas MA200 (Bullish)" : "Harga di bawah MA200 (Bearish)";
    
    document.getElementById('ma-50-analysis').textContent = ma50Analysis;
    document.getElementById('ma-200-analysis').textContent = ma200Analysis;
    
    // RSI Analysis
    let rsiAnalysis = "";
    if (rsi > 70) rsiAnalysis = "Overbought (Kemungkinan koreksi)";
    else if (rsi < 30) rsiAnalysis = "Oversold (Kemungkinan rebound)";
    else rsiAnalysis = "Netral";
    
    document.getElementById('rsi-analysis').textContent = rsiAnalysis;
    
    // Generate recommendation
    let recommendation = "";
    if (currentPrice > ma50 && currentPrice > ma200 && rsi < 70) {
        recommendation = "Strong Buy (Kuat tren naik)";
    } else if (currentPrice < ma50 && currentPrice < ma200 && rsi > 30) {
        recommendation = "Strong Sell (Kuat tren turun)";
    } else if (currentPrice > ma50 && rsi < 70) {
        recommendation = "Buy (Potensi kenaikan)";
    } else if (currentPrice < ma50 && rsi > 30) {
        recommendation = "Sell (Potensi penurunan)";
    } else {
        recommendation = "Hold (Tunggu konfirmasi lebih lanjut)";
    }
    
    document.getElementById('recommendation').textContent = recommendation;
}

// Calculate Moving Average
function calculateMA(data, period) {
    if (data.length < period) return 0;
    
    const slice = data.slice(data.length - period);
    const sum = slice.reduce((a, b) => a + b, 0);
    return sum / period;
}

// Calculate RSI
function calculateRSI(data, period) {
    if (data.length < period + 1) return 50;
    
    let gains = 0;
    let losses = 0;
    
    for (let i = data.length - period; i < data.length; i++) {
        const diff = data[i] - data[i - 1];
        if (diff >= 0) {
            gains += diff;
        } else {
            losses -= diff;
        }
    }
    
    const avgGain = gains / period;
    const avgLoss = losses / period;
    
    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
}

// Start real-time listener for new data
function startRealTimeListener() {
    firebase.firestore().collection('prices')
        .where('symbol', '==', symbol)
        .orderBy('timestamp', 'desc')
        .limit(1)
        .onSnapshot(snapshot => {
            if (!snapshot.empty) {
                // New data available, reload the data
                loadData();
            }
        }, error => {
            console.error("Real-time listener error:", error);
        });
}
