// src/app/login/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // ✅ Obter tenantId dos parâmetros da URL
  const tenantId = searchParams.get('tenant') || process.env.NEXT_PUBLIC_DEFAULT_TENANT_ID || 'default';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await login(email, password);
      // ✅ Redirecionar para o dashboard do tenant correto
      router.push(`/student/dashboard?tenant=${tenantId}`);
    } catch (error) {
      console.error('Erro no login:', error);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f9fafb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        padding: '32px',
        width: '100%',
        maxWidth: '400px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#111827',
            marginBottom: '8px'
          }}>
            🎓 Acessar Plataforma - {tenantId}
          </h1>
          <p style={{
            color: '#64748b',
            fontSize: '14px'
          }}>
            Entre com suas credenciais
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
              E-mail
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
              placeholder="seu@email.com"
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
              Senha
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
              background: isLoading ? '#94a3b8' : '#0ea5e9',
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
            {isLoading ? 'Entrando...' : 'Entrar'}
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
            Ainda não tem uma conta?
          </p>
          <Link
            href={`/register?tenant=${tenantId}`}
            style={{
              color: '#0ea5e9',
              fontWeight: '500',
              textDecoration: 'none'
            }}
          >
            Criar nova conta
          </Link>
        </div>
      </div>
    </div>
  );
}