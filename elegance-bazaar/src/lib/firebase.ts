// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAnalytics, Analytics, isSupported } from "firebase/analytics";

// Firebase loyihangiz konfiguratsiyasi (env faylidan olish yaxshiroq, lekin hozircha hardcode)
const firebaseConfig = {
  apiKey: "AIzaSyDHlvbSsPUpWEXYZ8UpaRI5PrbSQkESh1w",
  authDomain: "e-commerce-4c064.firebaseapp.com",
  projectId: "e-commerce-4c064",
  storageBucket: "e-commerce-4c064.firebasestorage.app",
  messagingSenderId: "568176006341",
  appId: "1:568176006341:web:9d41157ad7064ab8d14cac",
  measurementId: "G-LZSME9LNTB",
} as const;

// Firebase ilovasini ishga tushirish
const app = initializeApp(firebaseConfig);

// Analytics (tracking uchun, ixtiyoriy, server muhitida ishlashi uchun tekshiruv)
export let analytics: Analytics | null = null;
isSupported().then((yes) => {
  if (yes) {
    analytics = getAnalytics(app);
  }
});

// Authentication
export const auth: Auth = getAuth(app);

// Google provayder (Google bilan kirish uchun)
export const googleProvider = new GoogleAuthProvider();

// Firestore (buyurtmalar va boshqa ma'lumotlar uchun)
export const db: Firestore = getFirestore(app);

export default app;
