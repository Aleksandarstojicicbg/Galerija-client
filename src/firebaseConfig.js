// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAqtDlb3XRt03Kwp_RTf3EQxlr12z5ZcZc",
  authDomain: "photogalleryapp-2aa06.firebaseapp.com",
  projectId: "photogalleryapp-2aa06",
  storageBucket: "photogalleryapp-2aa06.firebasestorage.app",
  messagingSenderId: "355980508836",
  appId: "1:355980508836:web:e544f579fbacc840aab031",
  measurementId: "G-RE8707BLJ7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Inicijalizacija Firestore baze podataka
const db = getFirestore(app);
const analytics = getAnalytics(app);

export { db };
