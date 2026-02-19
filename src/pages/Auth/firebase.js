// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDycRzcu9CQ6oESsRM6fj2rIMuf5oDXLpg",
  authDomain: "bishalportfolio-5ff93.firebaseapp.com",
  projectId: "bishalportfolio-5ff93",
  storageBucket: "bishalportfolio-5ff93.firebasestorage.app",
  messagingSenderId: "865188887725",
  appId: "1:865188887725:web:822246432c3bb8355a1a24",
  measurementId: "G-8WMSTEYMT4",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider(); // 👈 add this