async function getXAUTPrice() {
    try {
        const response = await fetch('https://api.bitget.com/api/spot/v1/market/ticker?symbol=XAUTUSDT');
        const data = await response.json();
        return {
            price: parseFloat(data.data[0].last),
            high: parseFloat(data.data[0].high24h),
            low: parseFloat(data.data[0].low24h),
            volume: parseFloat(data.data[0].baseVol)
        };
    } catch (error) {
        console.error('Gagal mengambil harga:', error);
        return null;
    }
}

async function savePriceToFirebase(priceData) {
    try {
        const user = auth.currentUser;
        await db.collection("priceHistory").add({
            userId: user.uid,
            symbol: "XAUTUSDT",
            price: priceData.price,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
    } catch (error) {
        console.error('Gagal menyimpan data:', error);
    }
}

async function getPriceHistory(limit = 10) {
    try {
        const user = auth.currentUser;
        const snapshot = await db.collection("priceHistory")
            .where("userId", "==", user.uid)
            .orderBy("timestamp", "desc")
            .limit(limit)
            .get();
        
        return snapshot.docs.map(doc => doc.data());
    } catch (error) {
        console.error('Gagal mengambil riwayat:', error);
        return [];
    }
}

async function updatePriceHistoryTable() {
    const history = await getPriceHistory(10);
    const tableBody = document.getElementById('price-history');
    tableBody.innerHTML = history.map(item => `
        <tr>
            <td>${new Date(item.timestamp?.toDate()).toLocaleString()}</td>
            <td>$${item.price.toFixed(2)}</td>
            <td class="${Math.random() > 0.5 ? 'price-up' : 'price-down'}">
                ${(Math.random() > 0.5 ? '+' : '')}${(Math.random() * 0.5).toFixed(2)}%
            </td>
        </tr>
    `).join('');
}
