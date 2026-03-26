// ============================================
// FIREBASE AYARLARI
// ============================================
// 1. https://console.firebase.google.com adresine gidin
// 2. "Add Project" ile yeni proje oluşturun (isim: nakapp)
// 3. Authentication > Sign-in method > Email/Password'ı aktif edin
// 4. Firestore Database > Create database > Start in test mode
// 5. Project Settings > General > Your apps > Web app ekleyin
// 6. Aşağıdaki değerleri Firebase'den aldığınız değerlerle doldurun
// ============================================

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "BURAYA_FIREBASE_API_KEY",
  authDomain: "BURAYA_PROJE_ADI.firebaseapp.com",
  projectId: "BURAYA_PROJE_ADI",
  storageBucket: "BURAYA_PROJE_ADI.appspot.com",
  messagingSenderId: "BURAYA_SENDER_ID",
  appId: "BURAYA_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
