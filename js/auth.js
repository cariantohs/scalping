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

// Inisialisasi Firebase jika belum ada
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const database = firebase.database();

// Fungsi untuk mengambil data harga dari Bitget (DIPERBAIKI)
async function fetchBitgetPrice() {
  const BITGET_API_KEY = 'bg_1f934704f495ec2d66b6b8ed04359dcc';
  const symbol = 'XAUTUSDT_SPBL'; // Pastikan simbol benar
  
  try {
    // Tampilkan loading indicator
    if (document.getElementById('loading-indicator')) {
      document.getElementById('loading-indicator').style.display = 'flex';
    }
    
    const response = await fetch(`https://api.bitget.com/api/spot/v1/market/ticker?symbol=${symbol}`, {
      headers: { 
        'Content-Type': 'application/json',
        'X-BTK-APIKEY': BITGET_API_KEY 
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
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
    } else {
      throw new Error(data.msg || 'Gagal mengambil data dari Bitget');
    }
  } catch (error) {
    console.error('Error fetching Bitget price:', error);
    showNotification(`Error: ${error.message}`);
    return null;
  } finally {
    // Sembunyikan loading indicator
    if (document.getElementById('loading-indicator')) {
      document.getElementById('loading-indicator').style.display = 'none';
    }
  }
}

// Fungsi untuk menyimpan data ke Firebase (DIPERBAIKI)
async function savePriceToFirebase(priceData) {
  if (!priceData) {
    console.error('Tidak ada data untuk disimpan');
    return;
  }
  
  try {
    // Pastikan user sudah login
    const user = firebase.auth().currentUser;
    if (!user) {
      console.error('User tidak terautentikasi');
      showNotification('Silakan login kembali');
      return;
    }
    
    console.log('Menyimpan data:', priceData);
    
    // Gunakan timestamp sebagai key
    const timestamp = priceData.timestamp;
    const priceRef = database.ref(`prices/XAUTUSDT/${timestamp}`);
    
    await priceRef.set(priceData);
    console.log('Data berhasil disimpan di Firebase');
    
    // Tampilkan notifikasi di UI
    showNotification(`Data tersimpan: $${priceData.price.toFixed(2)}`);
    
    // Update tampilan
    updatePriceDisplay(priceData);
    
    // Update analisis
    updatePriceAnalysis(priceData);
    
  } catch (error) {
    console.error('Error menyimpan ke Firebase:', error);
    showNotification(`Error: ${error.message}`);
  }
}

// Update tampilan harga
function updatePriceDisplay(priceData) {
  try {
    const priceDisplay = document.getElementById('price-display');
    const priceChange = document.getElementById('price-change');
    const volume24h = document.getElementById('volume24h');
    const change24h = document.getElementById('change24h');
    const high24h = document.getElementById('high24h');
    const low24h = document.getElementById('low24h');
    const lastUpdated = document.getElementById('last-updated');
    const marketStatus = document.getElementById('market-status');
    
    if (priceDisplay) priceDisplay.textContent = `$${priceData.price.toFixed(2)}`;
    
    if (priceChange) {
      const changeClass = priceData.changePercent >= 0 ? 'positive' : 'negative';
      const changeSymbol = priceData.changePercent >= 0 ? '▲' : '▼';
      priceChange.textContent = `${changeSymbol} ${Math.abs(priceData.changePercent).toFixed(2)}%`;
      priceChange.className = `price-change ${changeClass}`;
    }
    
    if (marketStatus) {
      marketStatus.textContent = priceData.changePercent >= 0 ? 'Bullish' : 'Bearish';
      marketStatus.className = `trend-indicator ${priceData.changePercent >= 0 ? 'trend-up' : 'trend-down'}`;
    }
    
    if (volume24h) volume24h.textContent = `$${(priceData.volume / 1000000).toFixed(2)}M`;
    
    if (change24h) {
      change24h.textContent = `${priceData.changePercent >= 0 ? '+' : ''}${priceData.changePercent.toFixed(2)}%`;
      change24h.className = priceData.changePercent >= 0 ? 'positive' : 'negative';
    }
    
    if (high24h) high24h.textContent = `$${priceData.high.toFixed(2)}`;
    if (low24h) low24h.textContent = `$${priceData.low.toFixed(2)}`;
    
    if (lastUpdated) {
      const now = new Date();
      lastUpdated.textContent = `Terakhir update: ${now.toLocaleTimeString()}`;
    }
  } catch (error) {
    console.error('Error updating display:', error);
  }
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
      prices.push({
        ...childSnapshot.val(),
        timestamp: parseInt(childSnapshot.key)
      });
    });
    
    return prices.sort((a, b) => a.timestamp - b.timestamp);
  } catch (error) {
    console.error('Error loading historical data:', error);
    return [];
  }
}

// Fungsi untuk menghasilkan analisis harga
function updatePriceAnalysis(priceData) {
  try {
    // Hitung moving average (simulasi)
    const ma7 = priceData.price * (1 + (0.02 * (Math.random() > 0.5 ? 1 : -1)));
    
    // Hitung RSI acak
    const rsi = (40 + Math.random() * 30).toFixed(1);
    
    // Hitung volatilitas
    const volatility = ((priceData.high - priceData.low) / priceData.price * 100).toFixed(2);
    
    // Tentukan level support/resistance
    const support = (priceData.price * 0.985).toFixed(2);
    const resistance = (priceData.price * 1.015).toFixed(2);
    
    // Update UI
    if (document.getElementById('ma7-value')) {
      document.getElementById('ma7-value').textContent = `$${ma7.toFixed(2)}`;
    }
    if (document.getElementById('rsi-value')) {
      document.getElementById('rsi-value').textContent = rsi;
    }
    if (document.getElementById('volatility-value')) {
      document.getElementById('volatility-value').textContent = `${volatility}%`;
    }
    if (document.getElementById('sr-value')) {
      document.getElementById('sr-value').textContent = `$${support}/$${resistance}`;
    }
    
    // Update trading suggestion
    const suggestions = [
      "Pertimbangkan untuk membeli pada penurunan. Level support kuat teridentifikasi.",
      "Tahan posisi. Pasar sedang konsolidasi.",
      "Ambil keuntungan di dekat resistance. Pasar menunjukkan sinyal overbought.",
      "Pantau level support. Penembusan ke bawah mungkin menandakan pembalikan tren.",
      "Momentum bullish sedang terbentuk. Pertimbangkan untuk menambah posisi."
    ];
    
    if (document.getElementById('trading-suggestion')) {
      document.getElementById('trading-suggestion').textContent = 
        suggestions[Math.floor(Math.random() * suggestions.length)];
    }
  } catch (error) {
    console.error('Error updating analysis:', error);
  }
}

// Fungsi untuk menampilkan notifikasi
function showNotification(message) {
  try {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 12px 20px;
      background: #4285f4;
      color: white;
      border-radius: 8px;
      z-index: 1000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      font-size: 14px;
      max-width: 300px;
      animation: fadeIn 0.3s, fadeOut 0.3s 2.7s;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);
  } catch (error) {
    console.error('Error showing notification:', error);
  }
}

// Fungsi untuk update data secara berkala
function startPriceUpdates() {
  console.log('Memulai pembaruan harga...');
  
  // Update pertama kali
  fetchBitgetPrice()
    .then(priceData => {
      if (priceData) {
        savePriceToFirebase(priceData);
      }
    })
    .catch(error => {
      console.error('Error pada update pertama:', error);
      showNotification(`Error: ${error.message}`);
    });
  
  // Update setiap 30 detik
  const updateInterval = setInterval(() => {
    console.log('Memperbarui data...');
    fetchBitgetPrice()
      .then(priceData => {
        if (priceData) {
          savePriceToFirebase(priceData);
        }
      })
      .catch(error => {
        console.error('Error pada update berkala:', error);
        showNotification(`Error: ${error.message}`);
      });
  }, 30000);
  
  // Simpan interval ID untuk membersihkan nanti
  return updateInterval;
}

// Inisialisasi setelah halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.endsWith('dashboard.html')) {
    // Set avatar pengguna
    const user = firebase.auth().currentUser;
    if (user && document.getElementById('user-avatar')) {
      if (user.photoURL) {
        document.getElementById('user-avatar').src = user.photoURL;
      } else {
        const name = user.displayName || user.email.split('@')[0];
        document.getElementById('user-avatar').src = 
          `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
      }
    }
    
    // Mulai pembaruan harga
    const updateInterval = startPriceUpdates();
    
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
    
    // Refresh market data secara manual
    if (document.getElementById('refresh-market')) {
      document.getElementById('refresh-market').addEventListener('click', () => {
        fetchBitgetPrice()
          .then(priceData => {
            if (priceData) {
              savePriceToFirebase(priceData);
              showNotification('Data diperbarui!');
            }
          })
          .catch(console.error);
      });
    }
    
    // Bersihkan interval saat halaman ditutup
    window.addEventListener('beforeunload', () => {
      if (updateInterval) {
        clearInterval(updateInterval);
      }
    });
  }
});
