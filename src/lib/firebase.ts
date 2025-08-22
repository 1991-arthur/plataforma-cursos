// src/lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth'; // Importa o módulo de autenticação
import { getFirestore } from 'firebase/firestore'; // Importa o módulo do Firestore

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBY2XwIkuHY951zjQbfiF71YrEFv4b-E0w",
  authDomain: "plataforma-cursos-a5a39.firebaseapp.com",
  projectId: "plataforma-cursos-a5a39",
  storageBucket: "plataforma-cursos-a5a39.firebasestorage.app",
  messagingSenderId: "668434778973",
  appId: "1:668434778973:web:b73863d73f935053cbf6b4"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Inicializa e exporta os serviços do Firebase que você vai usar
export const auth = getAuth(app); // Para autenticação
export const db = getFirestore(app); // Para o banco de dados Firestore

// Exporta o app também, caso precise em algum momento específico
export default app;