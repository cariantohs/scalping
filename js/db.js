// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBO3Bvg9xQzvhkArwMv-8tYgEtxoWR_XKY",
  authDomain: "crypto-tracker-b3b6b.firebaseapp.com",
  databaseURL: "https://crypto-tracker-b3b6b-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "crypto-tracker-b3b6b",
  storageBucket: "crypto-tracker-b3b6b.firebasestorage.app",
  messagingSenderId: "241465917079",
  appId: "1:241465917079:web:3d031edf8ded704bb833d2",
  measurementId: "G-X85Y9VKG13"
};

// Inisialisasi Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Fungsi untuk mengambil data harga dari Bitget
async function fetchBitgetPrice() {
    const BITGET_API_KEY = 'bg_1f934704f495ec2d66b6b8ed04359dcc';
    const symbol = 'XAUTUSDT';
    
    try {
        const response = await fetch(`https://api.bitget.com/api/spot/v1/market/ticker?symbol=${symbol}`, {
            headers: { 'X-BTK-APIKEY': BITGET_API_KEY }
        });
        
        const data = await response.json();
        
        if (data.code === '00000' && data.data) {
            const ticker = data.data;
            return {
                price: parseFloat(ticker.close),
                open: parseFloat(ticker.open),
                high: parseFloat(ticker.high24h),
                low: parseFloat(ticker.low24h),
                volume: parseFloat(ticker.quoteVol),
                change: parseFloat(ticker.changeUsd),
                changePercent: parseFloat(ticker.changePercent),
                timestamp: Date.now()
            };
        }
        throw new Error('Gagal mengambil data dari Bitget');
    } catch (error) {
        console.error('Error fetching Bitget price:', error);
        throw error;
    }
}

// Fungsi untuk menyimpan data ke Firebase
async function savePriceToFirebase(priceData) {
    try {
        const userId = firebase.auth().currentUser?.uid;
        if (!userId) return;

        // Simpan data baru
        const newPriceRef = database.ref(`prices/XAUTUSDT/${Date.now()}`);
        await newPriceRef.set(priceData);
        
        // Update tampilan
        updatePriceDisplay(priceData);
        
        // Update analisis
        updatePriceAnalysis();
        
    } catch (error) {
        console.error('Error saving to Firebase:', error);
    }
}

// Update tampilan harga
function updatePriceDisplay(priceData) {
    const priceDisplay = document.getElementById('price-display');
    const priceChange = document.getElementById('price-change');
    const volume24h = document.getElementById('volume24h');
    const change24h = document.getElementById('change24h');
    const high24h = document.getElementById('high24h');
    const low24h = document.getElementById('low24h');
    const lastUpdated = document.getElementById('last-updated');
    
    // Format harga
    priceDisplay.textContent = `$${priceData.price.toFixed(2)}`;
    
    // Format perubahan harga
    const changeClass = priceData.changePercent >= 0 ? 'positive' : 'negative';
    const changeSymbol = priceData.changePercent >= 0 ? '▲' : '▼';
    priceChange.textContent = `${changeSymbol} ${Math.abs(priceData.changePercent).toFixed(2)}%`;
    priceChange.className = `price-change ${changeClass}`;
    
    // Format volume
    volume24h.textContent = `$${(priceData.volume / 1000000).toFixed(2)}M`;
    
    // Format perubahan 24h
    change24h.textContent = `${priceData.changePercent >= 0 ? '+' : ''}${priceData.changePercent.toFixed(2)}%`;
    change24h.className = changeClass;
    
    // Harga tertinggi/terendah
    high24h.textContent = `$${priceData.high.toFixed(2)}`;
    low24h.textContent = `$${priceData.low.toFixed(2)}`;
    
    // Waktu update
    lastUpdated.textContent = `Terakhir update: ${new Date().toLocaleTimeString()}`;
}

// Fungsi untuk memuat data historis
async function loadHistoricalData(hours = 24) {
    try {
        const now = Date.now();
        const cutoff = now - (hours * 60 * 60 * 1000);
        
        const snapshot = await database.ref('prices/XAUTUSDT')
            .orderByKey()
            .startAt(String(cutoff))
            .once('value');
        
        const prices = [];
        snapshot.forEach(childSnapshot => {
            prices.push(childSnapshot.val());
        });
        
        return prices.sort((a, b) => a.timestamp - b.timestamp);
    } catch (error) {
        console.error('Error loading historical data:', error);
        return [];
    }
}

// Fungsi untuk menghasilkan analisis harga
async function generatePriceAnalysis() {
    try {
        const historicalData = await loadHistoricalData(72); // 3 hari data
        if (historicalData.length < 2) return "Data tidak cukup untuk analisis";
        
        // Hitung perubahan terakhir
        const latest = historicalData[historicalData.length - 1];
        const prev = historicalData[historicalData.length - 2];
        const change = ((latest.price - prev.price) / prev.price) * 100;
        
        // Hitung moving average (7 poin terakhir)
        const maPoints = historicalData.slice(-7);
        const ma = maPoints.reduce((sum, point) => sum + point.price, 0) / maPoints.length;
        
        // Tentukan trend
        let trend = '';
        if (latest.price > ma && change > 0.5) {
            trend = 'bullish';
        } else if (latest.price < ma && change < -0.5) {
            trend = 'bearish';
        } else {
            trend = 'netral';
        }
        
        // Generate analisis
        const trendMap = {
            bullish: 'menguat (bullish)',
            bearish: 'melemah (bearish)',
            netral: 'cenderung stabil'
        };
        
        const volatility = (latest.high - latest.low) / latest.price * 100;
        let volatilityDesc = '';
        if (volatility > 5) volatilityDesc = 'tinggi';
        else if (volatility > 2) volatilityDesc = 'sedang';
        else volatilityDesc = 'rendah';
        
        return `
            <div>
                <strong>Trend saat ini:</strong> ${trendMap[trend]}
            </div>
            <div>
                <strong>Volatilitas:</strong> ${volatilityDesc} (${volatility.toFixed(2)}%)
            </div>
            <div>
                <strong>Perubahan terakhir:</strong> ${change >= 0 ? '+' : ''}${change.toFixed(2)}%
            </div>
            <div>
                <strong>Moving Average (7 poin):</strong> $${ma.toFixed(2)}
            </div>
            <div style="margin-top: 10px; font-style: italic">
                ${trend === 'bullish' ? 
                    'Harga menunjukkan sinyal beli dengan momentum positif' : 
                trend === 'bearish' ? 
                    'Harga menunjukkan tekanan jual, pertimbangkan untuk menunggu' : 
                    'Pasar sedang konsolidasi, pantau level support dan resistance'}
            </div>
        `;
        
    } catch (error) {
        console.error('Error generating analysis:', error);
        return "Gagal menghasilkan analisis harga";
    }
}

// Update analisis harga
async function updatePriceAnalysis() {
    const analysisElement = document.getElementById('price-analysis');
    analysisElement.innerHTML = "Menghasilkan analisis...";
    
    const analysis = await generatePriceAnalysis();
    analysisElement.innerHTML = analysis;
}

// Fungsi untuk update data secara berkala
function startPriceUpdates() {
    // Update pertama kali
    fetchBitgetPrice()
        .then(savePriceToFirebase)
        .catch(console.error);
    
    // Update setiap 30 detik
    setInterval(() => {
        fetchBitgetPrice()
            .then(savePriceToFirebase)
            .catch(console.error);
    }, 30000);
}

// Inisialisasi setelah halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.endsWith('dashboard.html')) {
        // Set avatar pengguna
        const user = firebase.auth().currentUser;
        if (user && user.photoURL) {
            document.getElementById('user-avatar').src = user.photoURL;
        }
        
        startPriceUpdates();
        updatePriceAnalysis();
        
        // Setup time filters
        document.querySelectorAll('.time-filter').forEach(button => {
            button.addEventListener('click', async () => {
                document.querySelectorAll('.time-filter').forEach(btn => 
                    btn.classList.remove('active'));
                
                button.classList.add('active');
                const hours = parseInt(button.dataset.hours);
                await updateChart(hours);
            });
        });
    }
});
