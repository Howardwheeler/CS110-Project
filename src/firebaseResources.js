import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDIgIgHbqN1-zgBZjKxIZ8efUZq1iPKMFQ",
  authDomain: "fleap-2025-5417f.firebaseapp.com",
  projectId: "fleap-2025-5417f",
  storageBucket: "fleap-2025-5417f.firebasestorage.app",
  messagingSenderId: "593857692145",
  appId: "1:593857692145:web:ae58f8379c181e63098450"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const firestore = getFirestore(app);
export const auth = getAuth(app);
