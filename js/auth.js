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

// Cek jika Firebase belum diinisialisasi
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();

// Fungsi Registrasi
async function registerUser(email, password) {
    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        await db.collection("users").doc(user.uid).set({
            email: email,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        localStorage.setItem('crypto_user', JSON.stringify({
            uid: user.uid,
            email: email
        }));
        
        return { success: true };
    } catch (error) {
        let errorMessage = "Gagal mendaftar";
        switch(error.code) {
            case 'auth/email-already-in-use':
                errorMessage = "Email sudah digunakan";
                break;
            case 'auth/invalid-email':
                errorMessage = "Email tidak valid";
                break;
            case 'auth/weak-password':
                errorMessage = "Password terlalu lemah (min 6 karakter)";
                break;
        }
        return { success: false, message: errorMessage };
    }
}

// Fungsi Login
async function loginUser(email, password) {
    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        localStorage.setItem('crypto_user', JSON.stringify({
            uid: user.uid,
            email: email
        }));
        
        return { success: true };
    } catch (error) {
        let errorMessage = "Gagal login";
        switch(error.code) {
            case 'auth/user-not-found':
                errorMessage = "Email tidak terdaftar";
                break;
            case 'auth/wrong-password':
                errorMessage = "Password salah";
                break;
        }
        return { success: false, message: errorMessage };
    }
}

// Fungsi Logout
function logoutUser() {
    auth.signOut().then(() => {
        localStorage.removeItem('crypto_user');
        window.location.href = "index.html";
    });
}

// Cek Status Auth
auth.onAuthStateChanged((user) => {
    const currentPage = window.location.pathname.split('/').pop();
    
    if (user) {
        if (currentPage === 'login.html') {
            window.location.href = "dashboard.html";
        }
    } else {
        if (currentPage === 'dashboard.html') {
            window.location.href = "login.html";
        }
    }
});
