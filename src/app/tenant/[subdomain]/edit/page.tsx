// src/app/tenant/[subdomain]/edit/page.tsx
'use client'; // Esta será uma Client Component para interatividade do formulário

import * as React from 'react'; // Importa React para usar React.use
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import Link from 'next/link';

// Definindo a interface para os dados do Tenant
interface TenantData {
  id: string;
  name: string;
  subdomain: string;
  ownerId: string;
  createdAt: any; // Pode ser Timestamp
  settings?: {
    logo?: string;
    primaryColor?: string;
    description?: string;
    // Adicione outros campos de configuração conforme necessário
  };
  // Adicione outros campos conforme necessário
}

export default function EditTenantPage({ params }: { params: Promise<{ subdomain: string }> }) {
  // ✅ Usa React.use para desembrulhar a Promise params
  const resolvedParams = React.use(params);
  const { subdomain } = resolvedParams;

  const router = useRouter();
  const [tenantData, setTenantData] = React.useState<TenantData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [updating, setUpdating] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Estados para os campos do formulário
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [primaryColor, setPrimaryColor] = React.useState('#3b82f6'); // Valor padrão azul
  const [logo, setLogo] = React.useState('');

  React.useEffect(() => {
    console.log(`[EditTenantPage] Carregando dados para edição do tenant: ${subdomain}`);

    const fetchTenant = async () => {
      if (!subdomain) {
        console.error('[EditTenantPage] Subdomínio não fornecido.');
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
          console.log(`[EditTenantPage] Tenant com subdomain '${subdomain}' não encontrado no Firestore.`);
          setError('Projeto não encontrado.');
          setLoading(false);
          return;
        }

        // Assumindo subdomínios únicos, pega o primeiro (e único) resultado
        const tenantDoc = querySnapshot.docs[0];
        const data: TenantData = {
          id: tenantDoc.id,
          ...(tenantDoc.data() as Omit<TenantData, 'id'>)
        };

        console.log(`[EditTenantPage] Dados do tenant '${subdomain}' carregados:`, data);
        setTenantData(data);

        // Preenche os estados do formulário com os dados atuais
        setName(data.name || '');
        setDescription(data.settings?.description || '');
        setPrimaryColor(data.settings?.primaryColor || '#3b82f6');
        setLogo(data.settings?.logo || '');

      } catch (err: any) {
        console.error(`[EditTenantPage] Erro ao buscar dados do tenant '${subdomain}':`, err);
        setError('Falha ao carregar os dados do projeto.');
      } finally {
        setLoading(false);
      }
    };

    fetchTenant();
  }, [subdomain]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantData) return;

    setUpdating(true);
    setMessage(null);

    try {
      // Atualiza o documento do tenant no Firestore
      const tenantRef = doc(db, 'tenants', tenantData.id);
      await updateDoc(tenantRef, {
        name: name.trim(),
        settings: {
          ...(tenantData.settings || {}), // Mantém outras configurações existentes
          description: description.trim(),
          primaryColor: primaryColor,
          logo: logo.trim(),
        }
        // Adicione outros campos que deseja atualizar aqui
      });

      console.log(`[EditTenantPage] Tenant '${tenantData.id}' atualizado com sucesso.`);
      setMessage({ type: 'success', text: 'Projeto atualizado com sucesso!' });
      
      // Atualiza o estado local para refletir as mudanças
      setTenantData(prev => prev ? {
        ...prev,
        name: name.trim(),
        settings: {
          ...(prev.settings || {}),
          description: description.trim(),
          primaryColor: primaryColor,
          logo: logo.trim(),
        }
      } : null);

    } catch (err: any) {
      console.error(`[EditTenantPage] Erro ao atualizar tenant '${tenantData.id}':`, err);
      setMessage({ type: 'error', text: 'Falha ao atualizar o projeto. Tente novamente.' });
    } finally {
      setUpdating(false);
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
          Carregando dados do projeto...
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
            <Link
              href={`/tenant/${subdomain}`} // Volta para a home do tenant
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
              Voltar para o Projeto
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!tenantData) {
    // Fallback, embora o useEffect trate
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
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>❓</div>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '8px',
            margin: '0 0 8px 0'
          }}>
            Projeto não encontrado
          </h2>
          <p style={{
            color: '#6b7280',
            marginBottom: '24px',
            margin: '0 0 24px 0'
          }}>
            Não foi possível carregar os dados para edição.
          </p>
          <Link
            href={`/tenant/${subdomain}`} // Volta para a home do tenant
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
            Voltar para o Projeto
          </Link>
        </div>
      </div>
    );
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
                🛠️ Editar Projeto - {tenantData.name}
              </h1>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              <Link
                href={`/tenant/${subdomain}`} // Volta para a home do tenant
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
                ← Voltar
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
            Configurações do Projeto
          </h2>

          {message && (
            <div style={{
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '24px',
              background: message.type === 'success' ? '#dcfce7' : '#fee2e2',
              border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
              color: message.type === 'success' ? '#166534' : '#991b1b'
            }}>
              {message.text}
            </div>
          )}

                    {/* Mensagem de Feedback - Mantém o mesmo estilo */}
          {message && (
            <div style={{
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '24px',
              background: message.type === 'success' ? '#dcfce7' : '#fee2e2',
              border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
              color: message.type === 'success' ? '#166534' : '#991b1b'
            }}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* ✅ CORREÇÃO: Layout em grid sem @media no style */}
            {/* Define um grid com duas colunas que se ajustará automaticamente */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr', // Duas colunas de tamanhos iguais
              gap: '20px'
            }}>
              {/* Coluna Esquerda - Informações Básicas */}
              <div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#334155',
                    marginBottom: '6px'
                  }}>
                    Nome do Projeto *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                    placeholder="Ex: Curso Completo de React"
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
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
                      readOnly // Subdomínio não é editável após a criação
                      style={{
                        flex: 1,
                        padding: '10px 12px',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px 0 0 8px',
                        fontSize: '14px',
                        outline: 'none',
                        background: '#f8fafc'
                      }}
                      placeholder="meu-curso"
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
                  <p style={{
                    marginTop: '6px',
                    fontSize: '12px',
                    color: '#94a3b8'
                  }}>
                    O subdomínio não pode ser alterado após a criação do projeto.
                  </p>
                </div>
              </div>

              {/* Coluna Direita - Configurações Visuais */}
              <div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#334155',
                    marginBottom: '6px'
                  }}>
                    Descrição do Projeto
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4} // Aumentado para 4 linhas
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      resize: 'vertical', // Permite redimensionar verticalmente
                      minHeight: '80px' // Altura mínima
                    }}
                    placeholder="Descreva brevemente seu projeto..."
                  ></textarea>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#334155',
                    marginBottom: '6px'
                  }}>
                    Cor Primária
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      style={{
                        width: '50px',
                        height: '40px',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        padding: '2px'
                      }}
                    />
                    <input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      style={{
                        flex: 1,
                        padding: '10px 12px',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                      placeholder="#3b82f6"
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#334155',
                    marginBottom: '6px'
                  }}>
                    URL do Logo
                  </label>
                  <input
                    type="url"
                    value={logo}
                    onChange={(e) => setLogo(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                    placeholder="https://exemplo.com/logo.png"
                  />
                  {logo && (
                    <div style={{ marginTop: '8px' }}>
                      <img
                        src={logo}
                        alt="Pré-visualização do Logo"
                        style={{
                          maxWidth: '100px',
                          maxHeight: '50px',
                          objectFit: 'contain',
                          border: '1px solid #e2e8f0',
                          borderRadius: '4px'
                        }}
                        onError={(e) => {
                          // Esconde a imagem se o URL for inválido
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                        onLoad={(e) => {
                          // Mostra a imagem quando carrega com sucesso
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'block';
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* ✅ FIM DA CORREÇÃO */}

            {/* Botão de Submissão - Mantém o mesmo estilo */}
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginTop: '24px',
              gap: '12px'
            }}>
              <Link
                href={`/tenant/${subdomain}`} // Volta para a home do tenant
                style={{
                  background: '#e2e8f0',
                  color: '#334155',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: '500',
                  border: '1px solid #cbd5e1'
                }}
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={updating}
                style={{
                  background: updating ? '#94a3b8' : '#0ea5e9',
                  color: 'white',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: updating ? 'not-allowed' : 'pointer',
                  fontWeight: '500',
                  transition: 'background-color 0.2s'
                }}
              >
                {updating ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}