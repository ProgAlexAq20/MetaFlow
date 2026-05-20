import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyBM75lT0LCmg-G0ZfDrpva9cSAtc1pleMg",
  authDomain: "metaflow-cc31b.firebaseapp.com",
  projectId: "metaflow-cc31b",
  storageBucket: "metaflow-cc31b.firebasestorage.app",
  messagingSenderId: "862371288879",
  appId: "1:862371288879:web:3a7b98a3490a89832df3da",
  measurementId: "G-EP6PBS54FR"
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