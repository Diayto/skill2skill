// src/lib/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAW7O_aEWC32W1k0pVHjA43xcTk6y9P58A",
  authDomain: "skill2skill-702ef.firebaseapp.com",
  projectId: "skill2skill-702ef",
  storageBucket: "skill2skill-702ef.firebasestorage.app",
  messagingSenderId: "401748107712",
  appId: "1:401748107712:web:a45ecf98b182171497a825",
  measurementId: "G-Y6X27WCM42"
};

const app = initializeApp(firebaseConfig);

// 👇 это нам нужно для логина/регистрации
export const auth = getAuth(app);
