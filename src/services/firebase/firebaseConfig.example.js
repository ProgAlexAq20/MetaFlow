<<<<<<< HEAD
// This is an example of the Firebase configuration.
// The actual configuration is loaded from environment variables in firebaseConfig.js
// and comes from your .env.local file.

export const firebaseConfigExample = {
  apiKey: "AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890abcd",
};

export default firebaseConfigExample;
=======
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

/**
 * This is an EXAMPLE file showing the structure.
 * DO NOT USE REAL KEYS HERE!
 * 
 * Copy this to firebaseConfig.js and fill with your actual Firebase credentials from:
 * https://console.firebase.google.com/
 * 
 * Or use environment variables instead:
 * src/services/firebase/firebaseConfig.js (recommended for production)
 */

const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abc123def456",
  measurementId: "G-XXXXXXXXXX"
};

export const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const db = getFirestore(app);

export const initAnalytics = async () => {
  if (typeof window !== 'undefined' && await isSupported()) {
    return getAnalytics(app);
  }
  return null;
};
>>>>>>> 741c92e (fix: pass firebase secrets to build)
