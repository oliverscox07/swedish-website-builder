import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { sendVerificationEmail } from '../utils/emailService';

interface User {
  uid: string;
  email: string;
  displayName?: string;
  emailVerified: boolean;
}

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  sendVerificationCode: (email: string) => Promise<void>;
  verifyCode: (email: string, code: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (email: string, password: string) => {
    try {
      console.log('Creating user account for:', email);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('User created successfully:', userCredential.user.uid);
      
      // Send verification code immediately
      await sendVerificationCode(email);
      
      return userCredential.user;
    } catch (error) {
      console.error('Error in registration process:', error);
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const sendVerificationCode = async (email: string) => {
    try {
      // Generate a simple 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Store the code in Firestore with expiration (5 minutes)
      const verificationRef = doc(db, 'verificationCodes', email);
      await setDoc(verificationRef, {
        code,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
      });
      
      console.log('Verification code generated:', code);
      
      // Send the code via email
      await sendVerificationEmail(email, code);
      
    } catch (error) {
      console.error('Error sending verification code:', error);
      throw error;
    }
  };

  const verifyCode = async (email: string, code: string): Promise<boolean> => {
    try {
      const verificationRef = doc(db, 'verificationCodes', email);
      const verificationDoc = await getDoc(verificationRef);
      
      if (!verificationDoc.exists()) {
        return false;
      }
      
      const data = verificationDoc.data();
      const now = new Date();
      const expiresAt = data.expiresAt.toDate();
      
      if (now > expiresAt) {
        // Code expired, delete it
        await setDoc(verificationRef, {});
        return false;
      }
      
      if (data.code === code) {
        // Code is valid, mark user as verified
        const userRef = doc(db, 'users', auth.currentUser?.uid || '');
        await setDoc(userRef, { emailVerified: true }, { merge: true });
        
        // Delete the verification code
        await setDoc(verificationRef, {});
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error verifying code:', error);
      return false;
    }
  };

  const sendPasswordReset = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        setCurrentUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email!,
          displayName: firebaseUser.displayName || undefined,
          emailVerified: firebaseUser.emailVerified,
        });
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    loading,
    login,
    register,
    logout,
    sendPasswordReset,
    sendVerificationCode,
    verifyCode,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
