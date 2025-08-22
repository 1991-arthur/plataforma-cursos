'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { user, signOut, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          fontSize: '20px',
          color: '#6b7280',
          background: 'white',
          padding: '24px 32px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          Carregando...
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      {/* Header */}
      <div style={{
        background: 'white',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 24px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '24px 0'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center'
            }}>
              <h1 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#111827',
                margin: 0
              }}>
                🎓 Plataforma de Cursos
              </h1>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              <span style={{ color: '#374151' }}>
                Olá, {user.displayName || user.email}!
              </span>
              <button
                onClick={handleSignOut}
                style={{
                  background: '#dc2626',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '500',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.target.style.background = '#b91c1c'}
                onMouseOut={(e) => e.target.style.background = '#dc2626'}
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '32px 24px'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          padding: '24px'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '16px',
            margin: '0 0 16px 0'
          }}>
            🎉 Parabéns! Firebase configurado com sucesso!
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
            marginTop: '24px'
          }}>
            <div style={{
              background: '#eff6ff',
              padding: '24px',
              borderRadius: '12px',
              border: '1px solid #dbeafe'
            }}>
              <h3 style={{
                fontWeight: '600',
                color: '#1e40af',
                marginBottom: '8px',
                margin: '0 0 8px 0'
              }}>
                ✅ Autenticação
              </h3>
              <p style={{
                color: '#2563eb',
                fontSize: '14px',
                margin: 0
              }}>
                Firebase Auth funcionando perfeitamente
              </p>
            </div>
            
            <div style={{
              background: '#f0fdf4',
              padding: '24px',
              borderRadius: '12px',
              border: '1px solid #dcfce7'
            }}>
              <h3 style={{
                fontWeight: '600',
                color: '#166534',
                marginBottom: '8px',
                margin: '0 0 8px 0'
              }}>
                ✅ Banco de Dados
              </h3>
              <p style={{
                color: '#16a34a',
                fontSize: '14px',
                margin: 0
              }}>
                Firestore configurado e pronto
              </p>
            </div>
            
            <div style={{
              background: '#faf5ff',
              padding: '24px',
              borderRadius: '12px',
              border: '1px solid #e9d5ff'
            }}>
              <h3 style={{
                fontWeight: '600',
                color: '#7c2d12',
                marginBottom: '8px',
                margin: '0 0 8px 0'
              }}>
                🚀 Próximo Passo
              </h3>
              <p style={{
                color: '#a855f7',
                fontSize: '14px',
                margin: 0
              }}>
                Sistema multi-tenant com subdomínios
              </p>
            </div>
          </div>

          <div style={{
            marginTop: '32px',
            padding: '16px',
            background: '#fefce8',
            border: '1px solid #fde047',
            borderRadius: '12px'
          }}>
            <h4 style={{
              fontWeight: '500',
              color: '#a16207',
              marginBottom: '8px',
              margin: '0 0 8px 0'
            }}>
              Informações do usuário:
            </h4>
            <div style={{
              color: '#ca8a04',
              fontSize: '14px',
              lineHeight: '1.5'
            }}>
              <div><strong>Email:</strong> {user.email}</div>
              <div><strong>Nome:</strong> {user.displayName || 'Não informado'}</div>
              <div><strong>ID:</strong> {user.uid}</div>
            </div>
          </div>

          <div style={{
            marginTop: '32px',
            padding: '24px',
            background: '#f0f9ff',
            border: '2px dashed #0ea5e9',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <h4 style={{
              fontWeight: '600',
              color: '#0369a1',
              marginBottom: '12px',
              margin: '0 0 12px 0'
            }}>
              🎯 Próximas Funcionalidades
            </h4>
            <div style={{
              color: '#0284c7',
              fontSize: '14px',
              lineHeight: '1.6'
            }}>
              • Sistema de subdomínios dinâmicos<br/>
              • Criação e gestão de cursos<br/>
              • Upload de materiais (vídeos, PDFs)<br/>
              • Sistema de pagamentos<br/>
              • Área do aluno com progresso
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}