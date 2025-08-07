// Inisialisasi Firebase Auth
const auth = firebase.auth();

// Fungsi logout
function logout() {
    auth.signOut()
        .then(() => {
            window.location.href = 'login.html';
        })
        .catch(error => {
            console.error('Logout error:', error);
            alert('Gagal logout: ' + error.message);
        });
}

// Pantau state autentikasi
auth.onAuthStateChanged(user => {
    if (!user && window.location.pathname.endsWith('dashboard.html')) {
        // Redirect ke login jika tidak ada user
        window.location.href = 'login.html';
    }
});
