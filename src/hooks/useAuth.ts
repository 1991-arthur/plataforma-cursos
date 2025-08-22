"use client";

import { useState, createContext, useContext } from "react";

const AuthContext = createContext({});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const signIn = async (email, password) => {
    console.log("Sign in:", email);
    setUser({ email, name: "Usuário Teste" });
    return true;
  };

  const signUp = async (email, password, name) => {
    console.log("Sign up:", email, name);
    setUser({ email, name });
    return true;
  };

  const signOut = async () => {
    setUser(null);
  };

  const value = {
    user,
    signIn,
    signUp,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
