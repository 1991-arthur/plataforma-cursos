// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '@/contexts/AuthContext'; // ✅ Importar AuthProvider

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Plataforma de Cursos",
  description: "Sua plataforma completa para criação e venda de cursos online",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  console.log('[Layout] Renderizando layout principal'); // ✅ Adicionado log
  
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <AuthProvider> {/* ✅ Envolvendo children com AuthProvider */}
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}