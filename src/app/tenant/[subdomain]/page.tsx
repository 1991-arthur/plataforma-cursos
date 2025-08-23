// src/app/tenant/[subdomain]/page.tsx
'use client';

import * as React from 'react'; // Importa React para usar React.use
import { useEffect, useState } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import Link from 'next/link';

// Definindo a interface para os dados do Tenant
interface TenantData {
  id: string;
  name: string;
  subdomain: string;
  ownerId: string;
  createdAt: any; // Pode ser Timestamp ou string
  settings?: {
    logo?: string;
    primaryColor?: string;
    description?: string;
  };
}

export default function TenantHomePage({ params }: { params: Promise<{ subdomain: string }> }) {
  // ✅ CORREÇÃO: Usa React.use para desembrulhar a Promise params
  const resolvedParams = React.use(params);
  const { subdomain } = resolvedParams;

  const [tenantData, setTenantData] = useState<TenantData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    console.log(`[TenantHomePage] Carregando página para o subdomínio/tenant: ${subdomain}`);

    const fetchTenant = async () => {
      if (!subdomain) {
        console.error('[TenantHomePage] Subdomínio não fornecido.');
        setError('Subdomínio inválido.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // CONSULTA CORRIGIDA: Buscar pelo campo 'subdomain' em vez do ID do documento
        const tenantsCollection = collection(db, 'tenants');
        const q = query(tenantsCollection, where('subdomain', '==', subdomain));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          console.log(`[TenantHomePage] Tenant com subdomain '${subdomain}' não encontrado no Firestore.`);
          setError('Projeto não encontrado.');
          setLoading(false);
          return; // Importante retornar aqui para evitar continuar
        }

        // Assumindo subdomínios únicos, pega o primeiro (e único) resultado
        const tenantDoc = querySnapshot.docs[0];
        const data: TenantData = {
          id: tenantDoc.id,
          ...(tenantDoc.data() as Omit<TenantData, 'id'>)
        };

        console.log(`[TenantHomePage] Dados do tenant '${subdomain}' carregados:`, data);
        setTenantData(data);
      } catch (err: any) {
        console.error(`[TenantHomePage] Erro ao buscar dados do tenant '${subdomain}':`, err);
        setError('Falha ao carregar os dados do projeto.');
      } finally {
        setLoading(false);
      }
    };

    fetchTenant();
  }, [subdomain]); // Re-executa se o subdomain mudar

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
          Carregando projeto...
        </div>
      </div>
    );
  }

  if (error) {
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
          maxWidth: '400px',
          width: '100%',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#dc2626',
            marginBottom: '8px',
            margin: '0 0 8px 0'
          }}>
            Ops!
          </h2>
          <p style={{
            color: '#374151',
            marginBottom: '24px',
            margin: '0 0 24px 0'
          }}>
            {error}
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
            <button
              onClick={() => router.back()}
              style={{
                background: '#e5e7eb',
                color: '#374151',
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              Voltar
            </button>
            <Link
              href="/dashboard"
              style={{
                background: '#0ea5e9',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: '500',
                display: 'inline-block'
              }}
            >
              Meus Projetos
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!tenantData) {
    // Fallback, embora o useEffect trate
    return notFound();
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
                🎓 {tenantData.name}
              </h1>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              <Link
                href="/dashboard"
                style={{
                  background: '#64748b',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: '500',
                  display: 'inline-block'
                }}
              >
                ← Voltar para Meus Projetos
              </Link>
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
            fontSize: '24px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '24px',
            margin: '0 0 24px 0'
          }}>
            🏠 Página Inicial do Projeto
          </h2>

          {/* Visão Geral do Projeto */}
          <div style={{
            background: '#f8fafc',
            padding: '24px',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            marginBottom: '32px'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#0f172a',
              marginBottom: '16px',
              margin: '0 0 16px 0'
            }}>
              📊 Visão Geral
            </h3>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px'
            }}>
              <div style={{
                background: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '20px'
              }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>📘</div>
                <h4 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#0f172a',
                  margin: '0 0 4px 0'
                }}>
                  {tenantData.name}
                </h4>
                <p style={{
                  fontSize: '14px',
                  color: '#64748b',
                  margin: 0
                }}>
                  Nome do projeto
                </p>
              </div>

              <div style={{
                background: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '20px'
              }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>🔗</div>
                <h4 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#0f172a',
                  margin: '0 0 4px 0'
                }}>
                  {tenantData.subdomain}
                </h4>
                <p style={{
                  fontSize: '14px',
                  color: '#64748b',
                  margin: 0
                }}>
                  Subdomínio
                </p>
              </div>

              <div style={{
                background: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '20px'
              }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>📅</div>
                <h4 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#0f172a',
                  margin: '0 0 4px 0'
                }}>
                  {tenantData.createdAt?.toDate ? tenantData.createdAt.toDate().toLocaleDateString('pt-BR') : tenantData.createdAt || 'Data não disponível'}
                </h4>
                <p style={{
                  fontSize: '14px',
                  color: '#64748b',
                  margin: 0
                }}>
                  Criado em
                </p>
              </div>
            </div>
          </div>

          {/* Seção de Ações */}
          <div>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#0f172a',
              marginBottom: '16px',
              margin: '0 0 16px 0'
            }}>
              🚀 Comece a Gerenciar
            </h3>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '20px'
            }}>
              <Link
                href={`/tenant/${tenantData.subdomain}/courses`}
                style={{
                  background: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '24px',
                  textDecoration: 'none',
                  display: 'block',
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}
                onMouseOut={(e) => e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.05)'}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '16px'
                }}>
                  <div style={{
                    background: '#dbeafe',
                    color: '#2563eb',
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px'
                  }}>
                    📚
                  </div>
                  <h4 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#0f172a',
                    margin: '0 0 0 16px'
                  }}>
                    Gerenciar Cursos
                  </h4>
                </div>
                <p style={{
                  color: '#64748b',
                  lineHeight: '1.5',
                  margin: '0 0 16px 0'
                }}>
                  Crie, edite e organize os cursos oferecidos por este projeto.
                </p>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  color: '#0ea5e9',
                  fontWeight: '500'
                }}>
                  Acessar
                  <span style={{ marginLeft: '8px' }}>→</span>
                </div>
              </Link>

              {/* Placeholder para outras seções futuras */}
              <div style={{
                background: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '24px',
                opacity: '0.6',
                cursor: 'not-allowed'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '16px'
                }}>
                  <div style={{
                    background: '#f1f5f9',
                    color: '#94a3b8',
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px'
                  }}>
                    👥
                  </div>
                  <h4 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#94a3b8',
                    margin: '0 0 0 16px'
                  }}>
                    Gerenciar Alunos
                  </h4>
                </div>
                <p style={{
                  color: '#94a3b8',
                  lineHeight: '1.5',
                  margin: '0 0 16px 0'
                }}>
                  Veja a lista de alunos matriculados e acompanhe seu progresso. (Em breve)
                </p>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  color: '#94a3b8',
                  fontWeight: '500'
                }}>
                  Em breve
                </div>
              </div>

              <div style={{
                background: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '24px',
                opacity: '0.6',
                cursor: 'not-allowed'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '16px'
                }}>
                  <div style={{
                    background: '#f1f5f9',
                    color: '#94a3b8',
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px'
                  }}>
                    📈
                  </div>
                  <h4 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#94a3b8',
                    margin: '0 0 0 16px'
                  }}>
                    Relatórios
                  </h4>
                </div>
                <p style={{
                  color: '#94a3b8',
                  lineHeight: '1.5',
                  margin: '0 0 16px 0'
                }}>
                  Acesse relatórios de desempenho e engajamento. (Em breve)
                </p>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  color: '#94a3b8',
                  fontWeight: '500'
                }}>
                  Em breve
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}