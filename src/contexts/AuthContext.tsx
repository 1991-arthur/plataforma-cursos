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
  console.log('[AuthProvider] Componente carregado');
  
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null
  });

  // Verificar estado de autenticação
  useEffect(() => {
    console.log('[Auth] Iniciando listener de estado de autenticação');
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('[Auth] Estado de autenticação mudou:', firebaseUser ? 'Usuário logado' : 'Nenhum usuário');
      
      if (firebaseUser) {
        try {
          console.log('[Auth] Processando usuário autenticado:', firebaseUser.uid);
          // Buscar dados do usuário no Firestore
          const db = getFirestore();
          console.log('[Auth] Buscando usuário no Firestore:', firebaseUser.uid);
          
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          console.log('[Auth] Documento encontrado:', userDoc.exists());
          
          let userData: User;
          
          if (userDoc.exists()) {
            // Usuário já existe
            console.log('[Auth] Usuário existente encontrado');
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
            console.log('[Auth] Atualizando último login');
            await setDoc(userDocRef, {
              lastLoginAt: new Date()
            }, { merge: true });
          } else {
            // ✅ Criar novo usuário no Firestore
            console.log('[Auth] 🚀 Criando novo usuário no Firestore para:', firebaseUser.uid);
            userData = {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: firebaseUser.displayName || 'Usuário',
              role: 'student',
              createdAt: new Date(),
              lastLoginAt: new Date(),
              isActive: true
            };
            
            console.log('[Auth] Dados do novo usuário:', userData);
            try {
              await setDoc(userDocRef, userData);
              console.log('[Auth] ✅ Usuário criado com sucesso no Firestore');
            } catch (createError) {
              console.error('[Auth] ❌ Erro ao criar usuário no Firestore:', createError);
              throw createError;
            }
          }
          
          console.log('[Auth] Usuário processado:', userData);
          setAuthState({
            user: userData,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
        } catch (error) {
          console.error('[Auth] ❌ Erro ao buscar/criar dados do usuário:', error);
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: 'Erro ao carregar dados do usuário'
          });
        }
      } else {
        console.log('[Auth] Nenhum usuário autenticado');
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null
        });
      }
    });

    return () => {
      console.log('[Auth] Limpando listener');
      unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('[Auth] Tentando login:', email);
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log('[Auth] Login bem-sucedido:', result.user.uid);
    } catch (error: any) {
      console.error('[Auth] Erro no login:', error);
      const errorMessage = getAuthErrorMessage(error.code);
      setAuthState(prev => ({ ...prev, error: errorMessage, isLoading: false }));
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      console.log('[Auth] Tentando registro:', email, name);
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Criar usuário no Firebase Auth
      console.log('[Auth] Criando usuário no Firebase Auth');
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      console.log('[Auth] Usuário criado no Auth:', firebaseUser.uid);
      
      // Atualizar nome do perfil
      console.log('[Auth] Atualizando perfil do usuário');
      await updateProfile(firebaseUser, { displayName: name });
      console.log('[Auth] Perfil atualizado');
      
      // Criar documento no Firestore imediatamente
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
      
      console.log('[Auth] Criando documento no Firestore para:', firebaseUser.uid);
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      await setDoc(userDocRef, userData);
      console.log('[Auth] ✅ Documento criado com sucesso no Firestore');
      
    } catch (error: any) {
      console.error('[Auth] ❌ Erro no registro:', error);
      const errorMessage = getAuthErrorMessage(error.code);
      setAuthState(prev => ({ ...prev, error: errorMessage, isLoading: false }));
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('[Auth] Fazendo logout');
      await signOut(auth);
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      });
      console.log('[Auth] Logout bem-sucedido');
    } catch (error) {
      console.error('[Auth] Erro ao fazer logout:', error);
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

  console.log('[AuthProvider] Provider renderizado com value:', value);
  
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
  console.log('[useAuth] Hook chamado, contexto:', context);
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