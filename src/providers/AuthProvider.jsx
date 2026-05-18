import React, { createContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/firebase/authService';
import { userService } from '../services/firebase/firestoreService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged(async (authUser) => {
      try {
        if (authUser) {
          // Check if user exists in Firestore, if not create it
          const existingUser = await userService.getUser(authUser.uid);
          
          if (!existingUser) {
            // Create new user document
            await userService.createUser(authUser.uid, {
              name: authUser.displayName || 'Usuário',
              email: authUser.email,
              photoURL: authUser.photoURL,
            });
          }

          setUser({
            uid: authUser.uid,
            email: authUser.email,
            displayName: authUser.displayName,
            photoURL: authUser.photoURL,
          });
          setError(null);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Auth state error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check for redirect result first
      const redirectUser = await authService.handleRedirectResult();
      if (redirectUser) {
        return redirectUser;
      }

      // Try popup/redirect
      const authUser = await authService.signInWithGoogle();
      return authUser;
    } catch (err) {
      console.error('Sign-in error:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await authService.signOut();
      setUser(null);
    } catch (err) {
      console.error('Sign-out error:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    user,
    loading,
    error,
    signInWithGoogle,
    signOut,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
