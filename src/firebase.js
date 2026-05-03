import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAovFrl7CeQvwJz_NWATkZk1H-4yYTff1o",
  authDomain: "e3-classes.firebaseapp.com",
  projectId: "e3-classes",
  storageBucket: "e3-classes.firebasestorage.app",
  messagingSenderId: "477809703498",
  appId: "1:477809703498:web:48ed29aa3f0f330bcd84b3",
  measurementId: "G-KC4BP77WXS"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);