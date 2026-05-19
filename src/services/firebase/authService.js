import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth';
import { auth } from './firebaseConfig';

const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('profile');
googleProvider.addScope('email');

export const authService = {
  // Try popup first, fallback to redirect on mobile/popup-blocked scenarios
  async signInWithGoogle() {
    try {
      // Set persistence before signing in
      await setPersistence(auth, browserLocalPersistence);
      
      // Try popup first (better UX on desktop)
      try {
        const result = await signInWithPopup(auth, googleProvider);
        return result.user;
      } catch (popupError) {
        // If popup is blocked or not supported, fallback to redirect
        if (
          popupError.code === 'auth/popup-blocked' ||
          popupError.code === 'auth/popup-closed-by-user' ||
          popupError.code === 'auth/operation-not-supported-in-this-environment'
        ) {
          console.log('Using redirect fallback for Google sign-in');
          await signInWithRedirect(auth, googleProvider);
          return null; // Redirect will reload the page
        }
        throw popupError;
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      throw error;
    }
  },

  // Handle redirect result (called after redirect flow completes)
  async handleRedirectResult() {
    try {
      const result = await getRedirectResult(auth);
      if (result) {
        return result.user;
      }
      return null;
    } catch (error) {
      console.error('Redirect result error:', error);
      throw error;
    }
  },

  // Sign out
  async signOut() {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Sign-out error:', error);
      throw error;
    }
  },

  // Listen to auth state changes
  onAuthStateChanged(callback) {
    return onAuthStateChanged(auth, callback);
  },

  // Get current user
  getCurrentUser() {
    return auth.currentUser;
  },

  // Get current user UID
  getCurrentUserId() {
    return auth.currentUser?.uid;
  },

  // Check if user is authenticated
  isAuthenticated() {
    return !!auth.currentUser;
  },
};

export default authService;
