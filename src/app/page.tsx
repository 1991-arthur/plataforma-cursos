// src/app/page.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        textAlign: 'center',
        maxWidth: '800px',
        width: '100%'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          padding: '48px 32px',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{
              fontSize: '48px',
              fontWeight: '800',
              color: '#1e3a8a',
              margin: '0 0 16px 0',
              lineHeight: '1.1'
            }}>
              🎓 Plataforma de Cursos
            </h1>
            <p style={{
              fontSize: '20px',
              color: '#475569',
              margin: 0,
              lineHeight: '1.6'
            }}>
              Sua solução completa para criação e venda de cursos online
            </p>
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            alignItems: 'center',
            marginBottom: '40px'
          }}>
            <div style={{
              display: 'flex',
              gap: '16px',
              flexWrap: 'wrap',
              justifyContent: 'center'
            }}>
              <Link
                href="/admin/login"
                style={{
                  background: '#1e3a8a',
                  color: 'white',
                  padding: '16px 32px',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: '18px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '12px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.2s, transform 0.1s'
                }}
                onMouseDown={(e) => {
                  const target = e.target as HTMLElement;
                  if (target.closest('a[style*="border-radius: 12px"]')) {
                    (target.closest('a[style*="border-radius: 12px"]') as HTMLElement).style.transform = 'scale(0.98)';
                  }
                }}
                onMouseUp={(e) => {
                  const target = e.target as HTMLElement;
                  if (target.closest('a[style*="border-radius: 12px"]')) {
                    (target.closest('a[style*="border-radius: 12px"]') as HTMLElement).style.transform = 'scale(1)';
                  }
                }}
                onMouseLeave={(e) => {
                  const target = e.target as HTMLElement;
                  if (target.closest('a[style*="border-radius: 12px"]')) {
                    (target.closest('a[style*="border-radius: 12px"]') as HTMLElement).style.transform = 'scale(1)';
                  }
                }}
              >
                🔐 Acesso Administrativo
              </Link>
              
              <Link
                href="/dashboard"
                style={{
                  background: 'white',
                  color: '#1e3a8a',
                  padding: '16px 32px',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: '18px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '12px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  border: '2px solid #1e3a8a',
                  transition: 'all 0.2s, transform 0.1s'
                }}
                onMouseDown={(e) => {
                  const target = e.target as HTMLElement;
                  if (target.closest('a[style*="border-radius: 12px"]')) {
                    (target.closest('a[style*="border-radius: 12px"]') as HTMLElement).style.transform = 'scale(0.98)';
                  }
                }}
                onMouseUp={(e) => {
                  const target = e.target as HTMLElement;
                  if (target.closest('a[style*="border-radius: 12px"]')) {
                    (target.closest('a[style*="border-radius: 12px"]') as HTMLElement).style.transform = 'scale(1)';
                  }
                }}
                onMouseLeave={(e) => {
                  const target = e.target as HTMLElement;
                  if (target.closest('a[style*="border-radius: 12px"]')) {
                    (target.closest('a[style*="border-radius: 12px"]') as HTMLElement).style.transform = 'scale(1)';
                  }
                }}
              >
                🎓 Área do Aluno
              </Link>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '24px',
            marginTop: '40px'
          }}>
            <div style={{
              background: '#f8fafc',
              padding: '24px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '16px' }}>📚</div>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '700',
                color: '#1e293b',
                margin: '0 0 8px 0'
              }}>
                Cursos Online
              </h3>
              <p style={{
                color: '#64748b',
                fontSize: '14px',
                margin: 0,
                lineHeight: '1.5'
              }}>
                Aulas gravadas e ao vivo com especialistas
              </p>
            </div>
            
            <div style={{
              background: '#f8fafc',
              padding: '24px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '16px' }}>🏆</div>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '700',
                color: '#1e293b',
                margin: '0 0 8px 0'
              }}>
                Certificados
              </h3>
              <p style={{
                color: '#64748b',
                fontSize: '14px',
                margin: 0,
                lineHeight: '1.5'
              }}>
                Certificados reconhecidos após conclusão
              </p>
            </div>
            
            <div style={{
              background: '#f8fafc',
              padding: '24px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '16px' }}>📱</div>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '700',
                color: '#1e293b',
                margin: '0 0 8px 0'
              }}>
                Acesso Móvel
              </h3>
              <p style={{
                color: '#64748b',
                fontSize: '14px',
                margin: 0,
                lineHeight: '1.5'
              }}>
                Estude de qualquer lugar, a qualquer hora
              </p>
            </div>
          </div>
        </div>
        
        <div style={{
          marginTop: '32px',
          color: 'rgba(255, 255, 255, 0.9)',
          fontSize: '14px'
        }}>
          © {new Date().getFullYear()} Plataforma de Cursos. Todos os direitos reservados.
        </div>
      </div>
    </div>
  );
}