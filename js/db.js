// Fungsi untuk mendapatkan harga XAUT/USDT dari Bitget
async function getXAUTPrice() {
    try {
        const response = await fetch('https://api.bitget.com/api/spot/v1/market/ticker?symbol=XAUTUSDT');
        const data = await response.json();
        
        if (data && data.data && data.data.length > 0) {
            return parseFloat(data.data[0].last);
        } else {
            throw new Error('Data tidak ditemukan');
        }
    } catch (error) {
        console.error('Error mengambil data harga:', error);
        return null;
    }
}

// Fungsi untuk menyimpan data harga ke Firebase
async function savePriceToFirebase(price) {
    try {
        const user = JSON.parse(localStorage.getItem('crypto_user'));
        if (!user) {
            console.error('Pengguna belum login');
            return;
        }
        
        const timestamp = firebase.firestore.FieldValue.serverTimestamp();
        
        await db.collection("priceHistory").add({
            userId: user.uid,
            symbol: "XAUTUSDT",
            price: price,
            timestamp: timestamp,
            exchange: "Bitget"
        });
        
        console.log('Data harga berhasil disimpan');
    } catch (error) {
        console.error('Error menyimpan data:', error);
    }
}

// Fungsi untuk mengambil riwayat harga dari Firebase
async function getPriceHistory(limit = 10) {
    try {
        const user = JSON.parse(localStorage.getItem('crypto_user'));
        if (!user) {
            console.error('Pengguna belum login');
            return [];
        }
        
        const snapshot = await db.collection("priceHistory")
            .where("userId", "==", user.uid)
            .where("symbol", "==", "XAUTUSDT")
            .orderBy("timestamp", "desc")
            .limit(limit)
            .get();
        
        return snapshot.docs.map(doc => doc.data());
    } catch (error) {
        console.error('Error mengambil riwayat harga:', error);
        return [];
    }
}

// Fungsi untuk memantau harga secara real-time
async function monitorPrice() {
    const price = await getXAUTPrice();
    if (price !== null) {
        // Perbarui UI dengan harga terbaru
        document.getElementById('current-price').textContent = `$${price.toFixed(2)}`;
        
        // Simpan harga ke Firebase
        await savePriceToFirebase(price);
        
        // Perbarui grafik dan riwayat
        updateChartWithNewPrice(price);
        updatePriceHistoryTable();
    }
    
    // Jadwalkan pemanggilan berikutnya setelah 60 detik
    setTimeout(monitorPrice, 60000);
}

// Mulai pemantauan harga saat dashboard dimuat
if (window.location.pathname.endsWith("dashboard.html")) {
    document.addEventListener("DOMContentLoaded", function() {
        const user = JSON.parse(localStorage.getItem('crypto_user'));
        if (user) {
            // Mulai pemantauan harga
            monitorPrice();
            
            // Muat riwayat harga
            updatePriceHistoryTable();
        }
    });
}

// Fungsi untuk memperbarui tabel riwayat harga
async function updatePriceHistoryTable() {
    const history = await getPriceHistory(10);
    const historyTable = document.getElementById('price-history');
    
    // Kosongkan tabel
    historyTable.innerHTML = '';
    
    // Tambahkan data baru
    history.forEach(entry => {
        const row = document.createElement('tr');
        const date = entry.timestamp.toDate();
        const dateString = `${date.getDate()} ${getMonthName(date.getMonth())} ${date.getFullYear()}, ${formatTime(date)}`;
        
        // Untuk perubahan harga, kita butuh data sebelumnya (dalam contoh ini kita tidak menyimpan perubahan)
        // Jadi kita akan gunakan placeholder
        const change = (Math.random() - 0.5) * 0.5;
        
        row.innerHTML = `
            <td>${dateString}</td>
            <td>$${entry.price.toFixed(2)}</td>
            <td class="${change >= 0 ? 'price-up' : 'price-down'}">${change >= 0 ? '+' : ''}${change.toFixed(2)}%</td>
        `;
        
        historyTable.appendChild(row);
    });
}

// Fungsi pembantu untuk format waktu
function formatTime(date) {
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
}

function getMonthName(monthIndex) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
    return months[monthIndex];
}
