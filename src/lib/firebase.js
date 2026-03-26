// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDvvH0wquXY7HvE_j_l3rWVDoh3T5_a9XE",
  authDomain: "nakkapp-cd89a.firebaseapp.com",
  projectId: "nakkapp-cd89a",
  storageBucket: "nakkapp-cd89a.firebasestorage.app",
  messagingSenderId: "988625639796",
  appId: "1:988625639796:web:d16d24b89bb0cc55cab421",
  measurementId: "G-J0KYQK68DV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);