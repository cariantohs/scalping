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

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

// Fungsi Login
function login() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errorElement = document.getElementById('login-error');
    
    errorElement.style.display = 'none';
    
    auth.signInWithEmailAndPassword(email, password)
        .then(() => {
            window.location.href = 'dashboard.html';
        })
        .catch((error) => {
            errorElement.textContent = error.message;
            errorElement.style.display = 'block';
        });
}

// Fungsi Register
function register() {
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const errorElement = document.getElementById('register-error');
    
    errorElement.style.display = 'none';
    
    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            return database.ref('users/' + user.uid).set({
                name: name,
                email: email,
                createdAt: new Date().toISOString()
            });
        })
        .then(() => {
            window.location.href = 'dashboard.html';
        })
        .catch((error) => {
            errorElement.textContent = error.message;
            errorElement.style.display = 'block';
        });
}

// Fungsi Logout
function logout() {
    auth.signOut().then(() => {
        window.location.href = 'index.html';
    }).catch(error => {
        console.error('Logout error:', error);
    });
}

// Pantau status autentikasi
auth.onAuthStateChanged((user) => {
    if (user) {
        // User sudah login
        if (window.location.pathname.endsWith('login.html') || 
            window.location.pathname.endsWith('index.html')) {
            window.location.href = 'dashboard.html';
        }
        
        // Update avatar di dashboard
        if (window.location.pathname.endsWith('dashboard.html')) {
            const avatar = document.getElementById('user-avatar');
            if (user.photoURL) {
                avatar.src = user.photoURL;
            } else {
                // Gunakan UI Avatars jika tidak ada foto
                const name = user.displayName || user.email.split('@')[0];
                avatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
            }
        }
    } else {
        // User belum login
        if (window.location.pathname.endsWith('dashboard.html')) {
            window.location.href = 'login.html';
        }
    }
});
