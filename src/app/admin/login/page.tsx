// src/app/admin/login/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error, user, isAuthenticated } = useAuth();
  const router = useRouter();

  // Redirecionar se já estiver autenticado como admin
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        // Se não for admin, mostrar mensagem de acesso negado
        setError('Acesso negado. Você não tem permissão de administrador.');
      }
    }
  }, [isAuthenticated, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // ✅ Usar credenciais de administrador hardcoded para teste
      // ✅ Em produção, você usaria um sistema de autenticação real
      if (email === 'admin@admin.com' && password === 'admin123') {
        // ✅ Simular login de administrador
        // Aqui você faria a chamada real para autenticação
        alert('Login administrativo simulado - em produção, conecte ao Firebase');
        router.push('/admin/dashboard');
        return;
      }
      
      // ✅ Para usuários reais, usar o sistema de autenticação normal
      await login(email, password);
      
    } catch (error) {
      console.error('Erro no login administrativo:', error);
      setError('Credenciais inválidas. Tente novamente.');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e3a8a 0%, #312e81 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        padding: '32px',
        width: '100%',
        maxWidth: '400px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#1e3a8a',
            marginBottom: '8px'
          }}>
            🔐 Painel Administrativo
          </h1>
          <p style={{
            color: '#64748b',
            fontSize: '14px'
          }}>
            Acesso restrito a administradores
          </p>
        </div>

        {error && (
          <div style={{
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '24px',
            background: '#fee2e2',
            border: '1px solid #fecaca',
            color: '#991b1b'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#334155',
              marginBottom: '6px'
            }}>
              E-mail Administrativo
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none'
              }}
              placeholder="admin@empresa.com"
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#334155',
              marginBottom: '6px'
            }}>
              Senha Administrativa
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none'
              }}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              background: isLoading ? '#94a3b8' : '#1e3a8a',
              color: 'white',
              padding: '12px 16px',
              borderRadius: '8px',
              border: 'none',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontWeight: '500',
              fontSize: '16px',
              transition: 'background-color 0.2s'
            }}
          >
            {isLoading ? 'Autenticando...' : 'Acessar Painel'}
          </button>
        </form>

        <div style={{
          textAlign: 'center',
          marginTop: '24px',
          paddingTop: '24px',
          borderTop: '1px solid #e5e7eb'
        }}>
          <p style={{
            color: '#64748b',
            fontSize: '14px',
            marginBottom: '16px'
          }}>
            Precisa de ajuda com o acesso?
          </p>
          <Link
            href="/"
            style={{
              color: '#3b82f6',
              fontWeight: '500',
              textDecoration: 'none'
            }}
          >
            ← Voltar para o site principal
          </Link>
        </div>
      </div>
    </div>
  );
}