// auth.js - Enhanced Version
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
try {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
    console.log("Firebase initialized in auth.js");
  }
} catch (error) {
  console.error("Firebase initialization error:", error);
}

const auth = firebase.auth();
const database = firebase.database();

// Fungsi Login
function login() {
  console.log("Login attempt started");
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  const errorElement = document.getElementById('login-error');
  
  errorElement.style.display = 'none';
  
  auth.signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      console.log("Login successful:", userCredential.user.email);
      window.location.href = 'dashboard.html';
    })
    .catch((error) => {
      console.error("Login error:", error);
      errorElement.textContent = error.message;
      errorElement.style.display = 'block';
    });
}

// Fungsi Register
function register() {
  console.log("Registration attempt started");
  const name = document.getElementById('register-name').value;
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;
  const errorElement = document.getElementById('register-error');
  
  errorElement.style.display = 'none';
  
  auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      console.log("User created:", user.uid);
      
      return database.ref('users/' + user.uid).set({
        name: name,
        email: email,
        createdAt: new Date().toISOString()
      });
    })
    .then(() => {
      console.log("User data saved to database");
      window.location.href = 'dashboard.html';
    })
    .catch((error) => {
      console.error("Registration error:", error);
      errorElement.textContent = error.message;
      errorElement.style.display = 'block';
    });
}

// Fungsi Logout
function logout() {
  console.log("Logout initiated");
  auth.signOut().then(() => {
    console.log("Logout successful");
    window.location.href = 'index.html';
  }).catch(error => {
    console.error('Logout error:', error);
  });
}

// Pantau status autentikasi
auth.onAuthStateChanged((user) => {
  console.log("Auth state changed:", user ? "User signed in" : "No user");
  
  if (user) {
    // User sudah login
    if (window.location.pathname.endsWith('login.html') || 
        window.location.pathname.endsWith('index.html')) {
      console.log("Redirecting to dashboard");
      window.location.href = 'dashboard.html';
    }
    
    // Update avatar di dashboard
    if (window.location.pathname.endsWith('dashboard.html')) {
      const avatar = document.getElementById('user-avatar');
      if (avatar) {
        if (user.photoURL) {
          avatar.src = user.photoURL;
          console.log("Avatar set from photoURL");
        } else {
          const name = user.displayName || user.email.split('@')[0];
          avatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
          console.log("Avatar set from UI Avatars");
        }
      }
    }
  } else {
    // User belum login
    if (window.location.pathname.endsWith('dashboard.html')) {
      console.log("Redirecting to login page");
      window.location.href = 'login.html';
    }
  }
});
