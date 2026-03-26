import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCGmMDFEvQSXxQ5khNmFpyFxO1WEcHqMQ",
  authDomain: "nakapp-f7b34.firebaseapp.com",
  projectId: "nakapp-f7b34",
  storageBucket: "nakapp-f7b34.firebasestorage.app",
  messagingSenderId: "971385492657",
  appId: "1:971385492657:web:c7faa497f212e8add9be90",
  measurementId: "G-8DN445XR5V"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);