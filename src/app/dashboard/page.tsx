// src/app/dashboard/page.tsx
'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs, orderBy } from 'firebase/firestore';
import { Button } from '@/components/ui/button'; // Certifique-se de que este componente existe

export default function DashboardPage() {
  const { user, signOut, loading } = useAuth();
  const router = useRouter();
  const [tenants, setTenants] = useState<any[]>([]);
  const [loadingTenants, setLoadingTenants] = useState(true);
  
  // Estados para o formulário de criação
  const [tenantName, setTenantName] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Carregar tenants do usuário
  useEffect(() => {
    if (user && !loading) {
      const fetchTenants = async () => {
        try {
          setLoadingTenants(true);
          const q = query(
            collection(db, 'tenants'),
            where('ownerId', '==', user.uid),
            orderBy('createdAt', 'desc')
          );
          const querySnapshot = await getDocs(q);
          const tenantsData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setTenants(tenantsData);
        } catch (error) {
          console.error('Erro ao carregar tenants:', error);
        } finally {
          setLoadingTenants(false);
        }
      };

      fetchTenants();
    }
  }, [user, loading]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setMessage({ type: 'error', text: 'Você precisa estar logado para criar um tenant.' });
      return;
    }

    if (!tenantName.trim() || !subdomain.trim()) {
      setMessage({ type: 'error', text: 'Nome e subdomínio são obrigatórios.' });
      return;
    }

    setCreating(true);
    setMessage(null);

    try {
      const newTenant = {
        name: tenantName.trim(),
        subdomain: subdomain.trim().toLowerCase(),
        ownerId: user.uid,
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'tenants'), newTenant);
      console.log('✅ Tenant criado com ID:', docRef.id);

      // Atualizar a lista de tenants
      setTenants(prev => [{
        id: docRef.id,
        ...newTenant,
        createdAt: new Date() // Para exibição imediata
      }, ...prev]);

      setMessage({ type: 'success', text: `Tenant "${tenantName}" criado com sucesso!` });
      
      // Limpar formulário
      setTenantName('');
      setSubdomain('');
    } catch (err: any) {
      console.error('❌ Erro ao criar tenant:', err);
      setMessage({ type: 'error', text: 'Falha ao criar o tenant. Tente novamente.' });
    } finally {
      setCreating(false);
    }
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
            fontSize: '24px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '24px',
            margin: '0 0 24px 0'
          }}>
            🎯 Dashboard Principal
          </h2>
          
          {/* Formulário de Criação de Tenant */}
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
              🏫 Criar Novo Projeto (Tenant)
            </h3>
            
            {message && (
              <div style={{
                padding: '12px 16px',
                borderRadius: '8px',
                marginBottom: '16px',
                background: message.type === 'success' ? '#dcfce7' : '#fee2e2',
                border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
                color: message.type === 'success' ? '#166534' : '#991b1b'
              }}>
                {message.text}
              </div>
            )}
            
            <form onSubmit={handleCreateTenant} style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr auto', 
              gap: '16px',
              alignItems: 'end'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#334155',
                  marginBottom: '6px'
                }}>
                  Nome do Projeto
                </label>
                <input
                  type="text"
                  value={tenantName}
                  onChange={(e) => setTenantName(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                  placeholder="Projeto Idiomas"
                />
              </div>
              
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#334155',
                  marginBottom: '6px'
                }}>
                  Subdomínio
                </label>
                <div style={{ display: 'flex' }}>
                  <input
                    type="text"
                    value={subdomain}
                    onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    required
                    style={{
                      flex: 1,
                      padding: '10px 12px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px 0 0 8px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                    placeholder="projeto-idiomas"
                  />
                  <span style={{
                    padding: '10px 12px',
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    borderLeft: 'none',
                    borderRadius: '0 8px 8px 0',
                    fontSize: '14px',
                    color: '#64748b'
                  }}>
                    .seudominio.com
                  </span>
                </div>
              </div>
              
              <Button 
                type="submit" 
                disabled={creating}
                style={{
                  height: '42px',
                  background: creating ? '#94a3b8' : '#0ea5e9',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: creating ? 'not-allowed' : 'pointer',
                  fontWeight: '500',
                  transition: 'background-color 0.2s'
                }}
              >
                {creating ? 'Criando...' : 'Criar Projeto'}
              </Button>
            </form>
          </div>
          
          {/* Lista de Tenants */}
          <div>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#0f172a',
              marginBottom: '16px',
              margin: '0 0 16px 0'
            }}>
              🗃️ Meus Projetos
            </h3>
            
            {loadingTenants ? (
              <div style={{
                textAlign: 'center',
                padding: '32px',
                color: '#64748b'
              }}>
                Carregando projetos...
              </div>
            ) : tenants.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '48px 24px',
                background: '#f8fafc',
                borderRadius: '8px',
                border: '1px dashed #cbd5e1'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📘</div>
                <h4 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#334155',
                  margin: '0 0 8px 0'
                }}>
                  Nenhum projeto criado ainda
                </h4>
                <p style={{
                  color: '#64748b',
                  margin: 0
                }}>
                  Crie seu primeiro projeto usando o formulário acima.
                </p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '20px'
              }}>
                {tenants.map((tenant) => (
                  <div 
                    key={tenant.id}
                    style={{
                      background: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '20px',
                      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '16px'
                    }}>
                      <div>
                        <h4 style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          color: '#0f172a',
                          margin: '0 0 4px 0'
                        }}>
                          {tenant.name}
                        </h4>
                        <div style={{
                          fontSize: '13px',
                          color: '#64748b'
                        }}>
                          {tenant.subdomain}.seudominio.com
                        </div>
                      </div>
                      <div style={{
                        background: '#dbeafe',
                        color: '#2563eb',
                        fontSize: '12px',
                        fontWeight: '600',
                        padding: '4px 8px',
                        borderRadius: '12px'
                      }}>
                        Ativo
                      </div>
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: '16px',
                      paddingTop: '16px',
                      borderTop: '1px solid #f1f5f9'
                    }}>
                      <div style={{
                        fontSize: '12px',
                        color: '#94a3b8'
                      }}>
                        Criado em: {tenant.createdAt?.toDate?.().toLocaleDateString('pt-BR') || 'Data não disponível'}
                      </div>
                      <button
                        onClick={() => {
                          // Abre direto a rota dinâmica correta
                          window.open(`/tenant/${tenant.subdomain}`, '_blank');
                        }}
                        style={{
                          background: '#0ea5e9',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '6px 12px',
                          fontSize: '13px',
                          cursor: 'pointer',
                          fontWeight: '500'
                        }}
                      >
                        Gerenciar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}