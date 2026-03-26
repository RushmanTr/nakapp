import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDvvH0wquXY7HvE_j_13rWDoh3T5_a9XE",
  authDomain: "nakapp-cd89a.firebaseapp.com",
  projectId: "nakapp-cd89a",
  storageBucket: "nakapp-cd89a.firebasestorage.app",
  messagingSenderId: "988625639796",
  appId: "1:988625639796:web:d16d24b89bb0cc55cab421",
  measurementId: "G-J0KYQK68DV"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);