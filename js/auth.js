// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
