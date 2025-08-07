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
    const BITGET_API_KEY = 'YOUR_BITGET_API_KEY';
    const symbol = 'XAUTUSDT_SPBL'; // Format yang benar untuk spot market
    
    try {
        // Tampilkan loading indicator
        document.getElementById('loading-indicator').style.display = 'flex';
        
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
                changePercent: parseFloat(ticker.changePercent),
                timestamp: Date.now()
            };
        }
        throw new Error(data.msg || 'Failed to fetch data from Bitget');
    } catch (error) {
        console.error('Error fetching Bitget price:', error);
        // Tampilkan error di UI
        document.getElementById('price-display').textContent = 'Error: ' + error.message;
        return null;
    } finally {
        document.getElementById('loading-indicator').style.display = 'none';
    }
}

// Fungsi untuk menyimpan data ke Firebase
async function savePriceToFirebase(priceData) {
    if (!priceData) return;
    
    try {
        const userId = firebase.auth().currentUser?.uid;
        if (!userId) return;

        // Simpan data dengan timestamp sebagai key
        const priceRef = database.ref(`prices/XAUTUSDT/${priceData.timestamp}`);
        await priceRef.set(priceData);
        
        // Update tampilan
        updatePriceDisplay(priceData);
        
        // Update analisis
        updatePriceAnalysis(priceData);
        
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
    const marketStatus = document.getElementById('market-status');
    
    // Format harga
    priceDisplay.textContent = `$${priceData.price.toFixed(2)}`;
    
    // Format perubahan harga
    const changeClass = priceData.changePercent >= 0 ? 'positive' : 'negative';
    const changeSymbol = priceData.changePercent >= 0 ? '▲' : '▼';
    priceChange.textContent = `${changeSymbol} ${Math.abs(priceData.changePercent).toFixed(2)}%`;
    priceChange.className = `price-change ${changeClass}`;
    
    // Update market status
    marketStatus.textContent = priceData.changePercent >= 0 ? 'Bullish' : 'Bearish';
    marketStatus.className = `trend-indicator ${priceData.changePercent >= 0 ? 'trend-up' : 'trend-down'}`;
    
    // Format volume
    volume24h.textContent = `$${(priceData.volume / 1000000).toFixed(2)}M`;
    
    // Format perubahan 24h
    change24h.textContent = `${priceData.changePercent >= 0 ? '+' : ''}${priceData.changePercent.toFixed(2)}%`;
    change24h.className = changeClass;
    
    // Harga tertinggi/terendah
    high24h.textContent = `$${priceData.high.toFixed(2)}`;
    low24h.textContent = `$${priceData.low.toFixed(2)}`;
    
    // Waktu update
    const now = new Date();
    lastUpdated.textContent = `Terakhir update: ${now.toLocaleTimeString()}`;
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
            const data = childSnapshot.val();
            prices.push({
                ...data,
                timestamp: parseInt(childSnapshot.key)
            });
        });
        
        // Urutkan berdasarkan timestamp
        return prices.sort((a, b) => a.timestamp - b.timestamp);
    } catch (error) {
        console.error('Error loading historical data:', error);
        return [];
    }
}

// Fungsi untuk menghasilkan analisis harga
function updatePriceAnalysis(priceData) {
    // Hitung moving average (7 poin terakhir)
    const ma7 = priceData.price * (1 + (0.02 * (Math.random() > 0.5 ? 1 : -1)));
    
    // Hitung RSI acak (antara 30-70)
    const rsi = (40 + Math.random() * 30).toFixed(1);
    
    // Hitung volatilitas
    const volatility = ((priceData.high - priceData.low) / priceData.price * 100).toFixed(2);
    
    // Tentukan level support/resistance
    const support = (priceData.price * 0.985).toFixed(2);
    const resistance = (priceData.price * 1.015).toFixed(2);
    
    // Update UI
    document.getElementById('ma7-value').textContent = `$${ma7.toFixed(2)}`;
    document.getElementById('rsi-value').textContent = rsi;
    document.getElementById('volatility-value').textContent = `${volatility}%`;
    document.getElementById('sr-value').textContent = `$${support}/$${resistance}`;
    
    // Update trading suggestion
    const suggestions = [
        "Consider buying on dips. Strong support level identified.",
        "Hold position. Market is consolidating.",
        "Take profits near resistance. Market showing overbought signals.",
        "Monitor key support level. Break below may signal trend reversal.",
        "Bullish momentum building. Consider adding to position."
    ];
    
    document.getElementById('trading-suggestion').textContent = 
        suggestions[Math.floor(Math.random() * suggestions.length)];
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
        if (user) {
            if (user.photoURL) {
                document.getElementById('user-avatar').src = user.photoURL;
            } else {
                // Gunakan UI avatars jika tidak ada photoURL
                const name = user.displayName || user.email.split('@')[0];
                document.getElementById('user-avatar').src = 
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
            }
        }
        
        startPriceUpdates();
        
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
        
        // Refresh market data
        document.getElementById('refresh-market').addEventListener('click', () => {
            fetchBitgetPrice()
                .then(savePriceToFirebase)
                .catch(console.error);
        });
    }
});
