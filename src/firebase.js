import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyARCXFT9pph3BFns8wh0J8Y1pQMfgw_6c4",
  authDomain: "e3-classes-8656d.firebaseapp.com",
  projectId: "e3-classes-8656d",
  storageBucket: "e3-classes-8656d.firebasestorage.app",
  messagingSenderId: "178425663692",
  appId: "1:178425663692:web:8c596ea081b31249dcb269",
  measurementId: "G-FYFL2SE5P8"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);