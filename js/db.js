// Fungsi untuk mengambil data harga dari Bitget
function fetchBitgetPrice() {
    const BITGET_API_KEY = 'YOUR_BITGET_API_KEY'; // Ganti dengan API Key Anda
    const symbol = 'XAUTUSDT_UMCBL';
    
    return fetch(`https://api.bitget.com/api/swap/v3/market/ticker?symbol=${symbol}`, {
        headers: {
            'X-BTK-APIKEY': BITGET_API_KEY
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.code === '00000' && data.data) {
            const ticker = data.data;
            return {
                price: parseFloat(ticker.last),
                timestamp: new Date().toISOString(),
                symbol: symbol,
                volume: parseFloat(ticker.base_vol),
                change: parseFloat(ticker.change_utc)
            };
        }
        throw new Error('Failed to fetch data from Bitget');
    });
}

// Fungsi untuk menyimpan data ke Firebase
function savePriceToFirebase(priceData) {
    const userId = firebase.auth().currentUser?.uid;
    if (!userId) return;
    
    const priceRef = database.ref('prices/XAUTUSDT');
    
    // Simpan data baru
    const newPriceRef = priceRef.push();
    newPriceRef.set(priceData);
    
    // Update tampilan
    document.getElementById('price-display').textContent = 
        `$${priceData.price.toFixed(2)}`;
    
    document.getElementById('last-updated').textContent = 
        `Terakhir update: ${new Date().toLocaleTimeString()}`;
}

// Fungsi untuk memuat data historis
function loadHistoricalData() {
    const priceRef = database.ref('prices/XAUTUSDT');
    
    return new Promise((resolve) => {
        priceRef.orderByChild('timestamp').limitToLast(100).once('value', (snapshot) => {
            const prices = [];
            snapshot.forEach((childSnapshot) => {
                prices.push(childSnapshot.val());
            });
            resolve(prices);
        });
    });
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
        startPriceUpdates();
    }
});