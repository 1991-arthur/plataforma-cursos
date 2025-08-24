// src/contexts/AuthContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth } from '@/lib/firebase';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut, 
  createUserWithEmailAndPassword,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc, getFirestore } from 'firebase/firestore';
import { User, AuthState } from '@/types/auth.types';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null
  });

  // Verificar estado de autenticação
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Buscar dados do usuário no Firestore
          const db = getFirestore();
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          
          let userData: User;
          
          if (userDoc.exists()) {
            // Usuário já existe
            const data = userDoc.data();
            userData = {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: data.name || firebaseUser.displayName || 'Usuário',
              role: data.role || 'student',
              createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
              lastLoginAt: new Date(),
              isActive: data.isActive !== undefined ? data.isActive : true
            };
            
            // Atualizar último login
            await setDoc(doc(db, 'users', firebaseUser.uid), {
              lastLoginAt: new Date()
            }, { merge: true });
          } else {
            // ✅ Criar novo usuário no Firestore
            userData = {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: firebaseUser.displayName || 'Usuário',
              role: 'student',
              createdAt: new Date(),
              lastLoginAt: new Date(),
              isActive: true
            };
            
            await setDoc(doc(db, 'users', firebaseUser.uid), userData);
          }
          
          setAuthState({
            user: userData,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
        } catch (error) {
          console.error('Erro ao buscar/criar dados do usuário:', error);
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: 'Erro ao carregar dados do usuário'
          });
        }
      } else {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error.code);
      setAuthState(prev => ({ ...prev, error: errorMessage, isLoading: false }));
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Criar usuário no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Atualizar nome do perfil
      await updateProfile(firebaseUser, { displayName: name });
      
      // ✅ Criar documento no Firestore imediatamente
      const db = getFirestore();
      const userData: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email || email,
        name: name,
        role: 'student',
        createdAt: new Date(),
        lastLoginAt: new Date(),
        isActive: true
      };
      
      await setDoc(doc(db, 'users', firebaseUser.uid), userData);
      
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error.code);
      setAuthState(prev => ({ ...prev, error: errorMessage, isLoading: false }));
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      throw error;
    }
  };

  const refreshUser = async () => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
    }
  };

  const value = {
    ...authState,
    login,
    register,
    logout,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
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

// Função para traduzir mensagens de erro do Firebase
function getAuthErrorMessage(code: string): string {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'Este e-mail já está em uso.';
    case 'auth/invalid-email':
      return 'E-mail inválido.';
    case 'auth/operation-not-allowed':
      return 'Operação não permitida.';
    case 'auth/weak-password':
      return 'A senha é muito fraca.';
    case 'auth/user-disabled':
      return 'Esta conta foi desativada.';
    case 'auth/user-not-found':
      return 'Usuário não encontrado.';
    case 'auth/wrong-password':
      return 'Senha incorreta.';
    case 'auth/too-many-requests':
      return 'Muitas tentativas. Tente novamente mais tarde.';
    default:
      return 'Ocorreu um erro. Tente novamente.';
  }
}