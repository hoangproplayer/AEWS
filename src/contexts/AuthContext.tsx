import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  User as FirebaseUser,
  signInWithEmailAndPassword
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/src/lib/firebase';
import { User, UserRole } from '@/src/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check mock user first
    const savedMockUser = localStorage.getItem('mock_user');
    if (savedMockUser) {
      setUser(JSON.parse(savedMockUser));
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Check if user exists in Firestore
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        
        if (userDoc.exists()) {
          setUser(userDoc.data() as User);
        } else {
          // If first time login, default to STUDENT for now or based on domain
          // In a real app, this might be handled by an admin or invitation
          const newUser: User = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || 'Unknown User',
            role: firebaseUser.email === 'admin@university.edu' ? UserRole.ADMIN : UserRole.STUDENT,
            photoURL: firebaseUser.photoURL || undefined
          };
          
          await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
          setUser(newUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    // Mock login support for preview
    if ((email === 'admin' || email === 'admin@university.edu') && pass === '123456') {
      const adminUser: User = {
        uid: 'mock-admin-id',
        email: 'admin@university.edu',
        displayName: 'Quản trị viên (Hệ thống)',
        role: UserRole.ADMIN
      };
      setUser(adminUser);
      localStorage.setItem('mock_user', JSON.stringify(adminUser));
      return;
    }

    if ((email === 'user' || email === 'user@university.edu') && pass === '123456') {
      const studentUser: User = {
        uid: '2012003',
        email: 'user@university.edu',
        displayName: 'Lê Văn C (Sinh viên)',
        role: UserRole.STUDENT,
        studentId: '2012003'
      };
      setUser(studentUser);
      localStorage.setItem('mock_user', JSON.stringify(studentUser));
      return;
    }

    if ((email === 'advisor' || email === 'advisor@university.edu') && pass === '123456') {
      const advisorUser: User = {
        uid: 'mock-advisor-id',
        email: 'advisor@university.edu',
        displayName: 'ThS. Nguyễn Văn A (Cố vấn)',
        role: UserRole.ADVISOR,
        classId: '20CNTT1'
      };
      setUser(advisorUser);
      localStorage.setItem('mock_user', JSON.stringify(advisorUser));
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (error) {
      console.error("Email login failed", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem('mock_user');
      setUser(null);
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signInWithEmail, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
