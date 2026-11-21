
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";

import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

// FIREBASE SOZLAMALARI
const firebaseConfig = {
    apiKey: "AIzaSyBScuOc0QzHgKGYcttV6xJLE5-a_KQe_vw",
    authDomain: "vexora-ai-7fb30.firebaseapp.com",
    projectId: "vexora-ai-7fb30",
    storageBucket: "vexora-ai-7fb30.firebasestorage.app",
    messagingSenderId: "1098553244764",
    appId: "1:1098553244764:web:03275de32603ab1939ba99",
    measurementId: "G-XSFREPW2WS"
};

// FIREBASE'NI ISHGA TUSHIRISH
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// KERAKLI FUNKSIYALARNI EKSPORT QILISH
export {
    auth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile,
    onAuthStateChanged,
    signOut
};
