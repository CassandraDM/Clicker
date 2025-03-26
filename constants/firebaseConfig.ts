import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAT5CqeeSWCUBeR8Pz7qAeZQMogb8Tj7c4",
  authDomain: "clicker-app-eddf1.firebaseapp.com",
  projectId: "clicker-app-eddf1",
  storageBucket: "clicker-app-eddf1.firebasestorage.app",
  messagingSenderId: "355742434573",
  appId: "1:355742434573:web:05d31ee7657d027bb19c44",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

export { db };
