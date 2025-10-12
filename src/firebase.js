import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyAto1Q5Bq2nHNNecCdsXLkLmpdNR2X_RdI",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "ashramam-network.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "ashramam-network",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "ashramam-network.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "135445089005",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:135445089005:web:e4205845f78ecf99291ae4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
