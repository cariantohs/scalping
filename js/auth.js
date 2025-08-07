// Inisialisasi Firebase
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
const auth = firebase.auth();
const db = firebase.firestore();

// Fungsi untuk mendaftar pengguna baru
function registerUser(email, password) {
    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Pengguna berhasil didaftarkan
            const user = userCredential.user;
            
            // Simpan data pengguna di Firestore
            db.collection("users").doc(user.uid).set({
                email: email,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            })
            .then(() => {
                // Simpan informasi pengguna di localStorage
                localStorage.setItem('crypto_user', JSON.stringify({
                    uid: user.uid,
                    email: email
                }));
                
                // Redirect ke dashboard
                window.location.href = "dashboard.html";
            })
            .catch((error) => {
                console.error("Error saving user data: ", error);
                document.getElementById("error-message").textContent = "Gagal menyimpan data pengguna: " + error.message;
            });
        })
        .catch((error) => {
            console.error("Registration error: ", error);
            document.getElementById("error-message").textContent = error.message;
        });
}

// Fungsi untuk login pengguna
function loginUser(email, password) {
    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Pengguna berhasil login
            const user = userCredential.user;
            
            // Simpan informasi pengguna di localStorage
            localStorage.setItem('crypto_user', JSON.stringify({
                uid: user.uid,
                email: email
            }));
            
            // Redirect ke dashboard
            window.location.href = "dashboard.html";
        })
        .catch((error) => {
            console.error("Login error: ", error);
            document.getElementById("error-message").textContent = error.message;
        });
}

// Fungsi untuk logout
function logoutUser() {
    auth.signOut()
        .then(() => {
            // Hapus informasi pengguna dari localStorage
            localStorage.removeItem('crypto_user');
            
            // Redirect ke halaman utama
            window.location.href = "index.html";
        })
        .catch((error) => {
            console.error("Logout error: ", error);
        });
}

// Cek status autentikasi saat halaman dimuat
auth.onAuthStateChanged((user) => {
    if (user) {
        // Pengguna sudah login
        if (window.location.pathname.endsWith("login.html")) {
            window.location.href = "dashboard.html";
        }
    } else {
        // Pengguna belum login
        if (window.location.pathname.endsWith("dashboard.html")) {
            window.location.href = "login.html";
        }
    }
});

// Tambahkan event listener untuk logout button
document.addEventListener("DOMContentLoaded", function() {
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", logoutUser);
    }
});
