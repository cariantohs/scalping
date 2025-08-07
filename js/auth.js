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

// Cek apakah Firebase sudah diinisialisasi
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();

// Fungsi Registrasi yang Diperbaiki
async function registerUser(email, password) {
    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // Simpan data tambahan pengguna di Firestore
        await db.collection("users").doc(user.uid).set({
            email: email,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            lastLogin: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Simpan informasi pengguna di localStorage
        localStorage.setItem('crypto_user', JSON.stringify({
            uid: user.uid,
            email: email,
            lastLogin: new Date().toISOString()
        }));
        
        // Redirect ke dashboard
        window.location.href = "dashboard.html";
        
        return { success: true };
    } catch (error) {
        console.error("Registration error:", error);
        
        // Pesan error yang lebih user-friendly
        let errorMessage = "Terjadi kesalahan saat pendaftaran";
        switch(error.code) {
            case 'auth/email-already-in-use':
                errorMessage = "Email sudah terdaftar";
                break;
            case 'auth/invalid-email':
                errorMessage = "Format email tidak valid";
                break;
            case 'auth/weak-password':
                errorMessage = "Password terlalu lemah (minimal 6 karakter)";
                break;
        }
        
        return { success: false, message: errorMessage };
    }
}

// Fungsi Login yang Diperbaiki
async function loginUser(email, password) {
    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // Update last login di Firestore
        await db.collection("users").doc(user.uid).update({
            lastLogin: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Simpan informasi pengguna di localStorage
        localStorage.setItem('crypto_user', JSON.stringify({
            uid: user.uid,
            email: email,
            lastLogin: new Date().toISOString()
        }));
        
        // Redirect ke dashboard
        window.location.href = "dashboard.html";
        
        return { success: true };
    } catch (error) {
        console.error("Login error:", error);
        
        // Pesan error yang lebih user-friendly
        let errorMessage = "Terjadi kesalahan saat login";
        switch(error.code) {
            case 'auth/user-not-found':
                errorMessage = "Email tidak terdaftar";
                break;
            case 'auth/wrong-password':
                errorMessage = "Password salah";
                break;
            case 'auth/invalid-email':
                errorMessage = "Format email tidak valid";
                break;
        }
        
        return { success: false, message: errorMessage };
    }
}

// Fungsi Logout
function logoutUser() {
    auth.signOut()
        .then(() => {
            localStorage.removeItem('crypto_user');
            window.location.href = "index.html";
        })
        .catch(error => {
            console.error("Logout error:", error);
        });
}

// Cek Status Auth
function checkAuthState() {
    return new Promise((resolve) => {
        auth.onAuthStateChanged(user => {
            if (user) {
                resolve({ isLoggedIn: true, user });
            } else {
                resolve({ isLoggedIn: false });
            }
        });
    });
}

// Export fungsi untuk digunakan di file lain
export { 
    registerUser, 
    loginUser, 
    logoutUser, 
    checkAuthState,
    auth,
    db 
};
