'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import toast from 'react-hot-toast';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Create user profile in Firestore
  const createUserProfile = async (user) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          credits: 3, // Free credits for new users
          subscriptionTier: 'free',
          createdAt: new Date(),
        });
        
        return {
          uid: user.uid,
          email: user.email,
          credits: 3,
          subscriptionTier: 'free',
          createdAt: new Date(),
        };
      } else {
        return userSnap.data();
      }
    } catch (error) {
      console.error('Error creating user profile:', error);
      toast.error('Failed to create user profile');
      return null;
    }
  };

  // Fetch user profile
  const fetchUserProfile = async (uid) => {
    try {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        return userSnap.data();
      }
      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  // Update user credits
  const updateUserCredits = async (newCredits) => {
    if (!user) return false;
    
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { credits: newCredits });
      
      setUserProfile(prev => ({ ...prev, credits: newCredits }));
      return true;
    } catch (error) {
      console.error('Error updating credits:', error);
      return false;
    }
  };

  // Sign up with email and password
  const signUp = async (email, password) => {
    try {
      setLoading(true);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const profile = await createUserProfile(result.user);
      setUserProfile(profile);
      toast.success('Account created successfully!');
      return { success: true };
    } catch (error) {
      console.error('Sign up error:', error);
      let message = 'Failed to create account';
      
      if (error.code === 'auth/email-already-in-use') {
        message = 'Email is already registered';
      } else if (error.code === 'auth/weak-password') {
        message = 'Password should be at least 6 characters';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Invalid email address';
      }
      
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Sign in with email and password
  const signIn = async (email, password) => {
    try {
      setLoading(true);
      const result = await signInWithEmailAndPassword(auth, email, password);
      const profile = await fetchUserProfile(result.user.uid);
      setUserProfile(profile);
      toast.success('Welcome back!');
      return { success: true };
    } catch (error) {
      console.error('Sign in error:', error);
      let message = 'Failed to sign in';
      
      if (error.code === 'auth/user-not-found') {
        message = 'No account found with this email';
      } else if (error.code === 'auth/wrong-password') {
        message = 'Incorrect password';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Invalid email address';
      } else if (error.code === 'auth/too-many-requests') {
        message = 'Too many failed attempts. Please try again later';
      }
      
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      
      const result = await signInWithPopup(auth, provider);
      const profile = await createUserProfile(result.user);
      setUserProfile(profile);
      toast.success('Welcome to Prompt IQ!');
      return { success: true };
    } catch (error) {
      console.error('Google sign in error:', error);
      
      let message = 'Failed to sign in with Google';
      
      if (error.code === 'auth/popup-closed-by-user') {
        message = 'Sign in cancelled';
      } else if (error.code === 'auth/popup-blocked') {
        message = 'Popup blocked. Please allow popups and try again';
      } else if (error.code === 'auth/unauthorized-domain') {
        message = 'This domain is not authorized for Google sign in';
      } else if (error.code === 'auth/operation-not-allowed') {
        message = 'Google sign in is not enabled. Please contact support';
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        message = 'An account already exists with this email using a different sign-in method';
      }
      
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Reset password
  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset email sent!');
      return { success: true };
    } catch (error) {
      console.error('Password reset error:', error);
      let message = 'Failed to send reset email';
      
      if (error.code === 'auth/user-not-found') {
        message = 'No account found with this email';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Invalid email address';
      }
      
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setUserProfile(null);
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out');
    }
  };

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const profile = await fetchUserProfile(user.uid);
        setUserProfile(profile);
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    user,
    userProfile,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    updateUserCredits,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
