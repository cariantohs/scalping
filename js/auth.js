// Inisialisasi Firebase dengan konfigurasi Anda
const firebaseConfig = {
    apiKey: "AIzaSyABC...",
    authDomain: "crypto-tracker.firebaseapp.com",
    projectId: "crypto-tracker",
    storageBucket: "crypto-tracker.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abc123..."
};

// Inisialisasi Firebase
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
        .then((userCredential) => {
            // Berhasil login, arahkan ke dashboard
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
            // Simpan info tambahan user
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
        
        // Tampilkan info user di dashboard
        if (document.getElementById('user-avatar')) {
            const avatar = document.getElementById('user-avatar');
            const name = user.displayName || user.email.split('@')[0];
            
            avatar.innerHTML = `
                <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random" alt="Avatar">
                <span>${name}</span>
            `;
        }
    } else {
        // User belum login
        if (window.location.pathname.endsWith('dashboard.html')) {
            window.location.href = 'login.html';
        }
    }
});