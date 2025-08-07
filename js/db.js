// db.js - Enhanced Debugging Version
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
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
  console.log("Firebase initialized");
}
const database = firebase.database();
console.log("Database instance created");

// CoinGecko API Configuration
const COIN_GECKO_API_URL = "https://api.coingecko.com/api/v3";
const COIN_ID = "tether-gold"; // Tether Gold (XAUT)

// Fungsi untuk mengambil data harga dari CoinGecko
async function fetchGoldPrice() {
  console.log("Memulai pengambilan data dari CoinGecko...");
  try {
    // Tampilkan loading indicator
    if (document.getElementById('loading-indicator')) {
      document.getElementById('loading-indicator').style.display = 'flex';
    }
    
    // Fetch market data
    const response = await fetch(`${COIN_GECKO_API_URL}/coins/${COIN_ID}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`);
    console.log("Response status:", response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    
    const data = await response.json();
    console.log("Data diterima dari CoinGecko:", data);
    
    // Extract relevant data
    const marketData = data.market_data;
    const priceData = {
      price: marketData.current_price.usd,
      high: marketData.high_24h.usd,
      low: marketData.low_24h.usd,
      volume: marketData.total_volume.usd,
      changePercent: marketData.price_change_percentage_24h,
      marketCap: marketData.market_cap.usd,
      timestamp: Date.now()
    };
    
    console.log("Data yang diproses:", priceData);
    return priceData;
  } catch (error) {
    console.error('Error fetching from CoinGecko:', error);
    showNotification(`Error: ${error.message}`, true);
    return null;
  } finally {
    // Sembunyikan loading indicator
    if (document.getElementById('loading-indicator')) {
      document.getElementById('loading-indicator').style.display = 'none';
    }
  }
}

// Fungsi untuk menyimpan data ke Firebase
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
      showNotification('Silakan login kembali', true);
      return;
    }
    
    console.log('Menyimpan data ke Firebase:', priceData);
    
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
    showNotification(`Error Firebase: ${error.message}`, true);
  }
}

// Update tampilan harga
function updatePriceDisplay(priceData) {
  console.log("Memperbarui tampilan dengan data:", priceData);
  try {
    const priceDisplay = document.getElementById('price-display');
    const priceChange = document.getElementById('price-change');
    const volume24h = document.getElementById('volume24h');
    const change24h = document.getElementById('change24h');
    const high24h = document.getElementById('high24h');
    const low24h = document.getElementById('low24h');
    const marketCap = document.getElementById('market-cap');
    const lastUpdated = document.getElementById('last-updated');
    const marketStatus = document.getElementById('market-status');
    
    if (priceDisplay) {
      priceDisplay.textContent = `$${priceData.price.toFixed(2)}`;
      console.log("Harga diperbarui");
    }
    
    if (priceChange) {
      const changeClass = priceData.changePercent >= 0 ? 'positive' : 'negative';
      const changeSymbol = priceData.changePercent >= 0 ? '▲' : '▼';
      priceChange.textContent = `${changeSymbol} ${Math.abs(priceData.changePercent).toFixed(2)}%`;
      priceChange.className = `price-change ${changeClass}`;
      console.log("Perubahan harga diperbarui");
    }
    
    if (marketStatus) {
      marketStatus.textContent = priceData.changePercent >= 0 ? 'Bullish' : 'Bearish';
      marketStatus.className = `trend-indicator ${priceData.changePercent >= 0 ? 'trend-up' : 'trend-down'}`;
      console.log("Status pasar diperbarui");
    }
    
    if (volume24h) {
      volume24h.textContent = `$${(priceData.volume / 1000000).toFixed(2)}M`;
      console.log("Volume diperbarui");
    }
    
    if (change24h) {
      change24h.textContent = `${priceData.changePercent >= 0 ? '+' : ''}${priceData.changePercent.toFixed(2)}%`;
      change24h.className = priceData.changePercent >= 0 ? 'positive' : 'negative';
      console.log("Perubahan 24h diperbarui");
    }
    
    if (high24h) {
      high24h.textContent = `$${priceData.high.toFixed(2)}`;
      console.log("High 24h diperbarui");
    }
    
    if (low24h) {
      low24h.textContent = `$${priceData.low.toFixed(2)}`;
      console.log("Low 24h diperbarui");
    }
    
    if (marketCap) {
      marketCap.textContent = `$${(priceData.marketCap / 1000000).toFixed(2)}M`;
      console.log("Market cap diperbarui");
    }
    
    if (lastUpdated) {
      const now = new Date();
      lastUpdated.textContent = `Terakhir update: ${now.toLocaleTimeString()}`;
      console.log("Waktu update diperbarui");
    }
  } catch (error) {
    console.error('Error updating display:', error);
    showNotification(`Error UI: ${error.message}`, true);
  }
}

// ... (fungsi lainnya tetap sama seperti sebelumnya)

// Fungsi untuk update data secara berkala
function startPriceUpdates() {
  console.log('Memulai pembaruan harga...');
  
  // Update pertama kali
  fetchGoldPrice()
    .then(priceData => {
      if (priceData) {
        console.log("Data berhasil diambil, menyimpan...");
        savePriceToFirebase(priceData);
      } else {
        console.log("Tidak ada data yang didapatkan");
      }
    })
    .catch(error => {
      console.error('Error pada update pertama:', error);
      showNotification(`Error: ${error.message}`, true);
    });
  
  // Update setiap 30 detik
  const updateInterval = setInterval(() => {
    console.log('Memperbarui data...');
    fetchGoldPrice()
      .then(priceData => {
        if (priceData) {
          savePriceToFirebase(priceData);
        }
      })
      .catch(error => {
        console.error('Error pada update berkala:', error);
        showNotification(`Error: ${error.message}`, true);
      });
  }, 30000);
  
  return updateInterval;
}

// Inisialisasi setelah halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
  console.log('Halaman dashboard dimuat');
  
  if (window.location.pathname.endsWith('dashboard.html')) {
    // Cek status Firebase
    console.log("Firebase app:", firebase.app().name);
    console.log("Database URL:", database.ref().toString());
    
    // Set avatar pengguna
    const user = firebase.auth().currentUser;
    if (user) {
      console.log("User terautentikasi:", user.email);
      
      if (document.getElementById('user-avatar')) {
        if (user.photoURL) {
          document.getElementById('user-avatar').src = user.photoURL;
          console.log("Avatar user diatur dari photoURL");
        } else {
          const name = user.displayName || user.email.split('@')[0];
          document.getElementById('user-avatar').src = 
            `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
          console.log("Avatar user diatur dari UI Avatars");
        }
      }
    } else {
      console.error("User tidak terautentikasi, redirect ke login");
      window.location.href = 'login.html';
      return;
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
        console.log(`Memperbarui grafik untuk ${hours} jam`);
        await updateChart(hours);
      });
    });
    
    // Refresh market data secara manual
    if (document.getElementById('refresh-market')) {
      document.getElementById('refresh-market').addEventListener('click', () => {
        console.log("Refresh manual dipicu");
        fetchGoldPrice()
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
        console.log("Interval dibersihkan");
      }
    });
  }
});
