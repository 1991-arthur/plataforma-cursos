// src/app/tenant/[subdomain]/dashboard/courses/create/page.tsx
'use client';

import * as React from 'react'; // ✅ Importa React
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import Link from 'next/link'; // Para o link de voltar

export default function CreateCoursePage({ params }: { params: Promise<{ subdomain: string }> }) {
  // ✅ Usa React.use para desembrulhar a Promise params
  const resolvedParams = React.use(params);
  const { subdomain } = resolvedParams;
  
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [status, setStatus] = useState('draft');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); // Tipagem explícita
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null); // Para feedback

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setMessage({ type: 'error', text: 'O título do curso é obrigatório.' });
      return;
    }

    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      console.log(`[CreateCoursePage] Criando novo curso para o tenant: ${subdomain}`);
      
      // --- PASSO 1: Buscar o ID do tenant pelo subdomain ---
      // (Você pode otimizar isso passando o tenantId diretamente se já estiver disponível)
      // Para esta página, vamos assumir que o tenantId é o mesmo que o subdomain
      // ou você pode fazer uma consulta como nas outras páginas.
      // Vamos manter a simplicidade por enquanto, mas idealmente buscar o tenantId real.
      
      // Para manter a consistência, vamos buscar o tenantId real.
      // Isso requer uma consulta ao Firestore, o que pode ser feito aqui ou passando o ID.
      // Vamos supor que o ID do tenant é o mesmo que o subdomain por enquanto.
      // ATENÇÃO: Isso só funciona se o ID do documento no Firestore for o mesmo que o subdomain.
      // Na prática, é melhor buscar o tenant pelo subdomain e obter o ID real.
      // Vamos manter assim por simplicidade, mas anote que isso pode precisar de ajuste.
      const tenantId = subdomain; 

      const docRef = await addDoc(collection(db, 'courses'), {
        title: title.trim(),
        description: description.trim(),
        price: price ? parseFloat(price) : 0,
        status,
        tenantId, // ID do tenant ao qual o curso pertence
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      console.log('[CreateCoursePage] ✅ Curso criado com ID:', docRef.id);
      setMessage({ type: 'success', text: `Curso "${title}" criado com sucesso!` });
      
      // Limpar formulário
      setTitle('');
      setDescription('');
      setPrice('');
      setStatus('draft');

      // Redirecionar para a lista de cursos após um breve delay
      setTimeout(() => {
        router.push(`/tenant/${subdomain}/courses`);
      }, 1500);

    } catch (err: any) {
      console.error('[CreateCoursePage] ❌ Erro ao criar curso:', err);
      setMessage({ type: 'error', text: 'Falha ao criar o curso. Tente novamente.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      {/* Header - Mantendo a consistência */}
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
                🆕 Criar Novo Curso
              </h1>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              <Link
                href={`/tenant/${subdomain}/dashboard/courses`} // Volta para a lista de cursos
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
            Informações do Curso
          </h2>

          {/* Mensagem de Feedback */}
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
              gridTemplateColumns: '1fr 1fr', // Duas colunas de tamanhos iguais por padrão
              gap: '20px'
            }}>
              {/* Coluna Esquerda - Título e Descrição */}
              <div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#334155',
                    marginBottom: '6px'
                  }}>
                    Título do Curso *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                    placeholder="Ex: Curso Completo de Next.js"
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
                    Descrição
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      resize: 'vertical',
                      minHeight: '100px'
                    }}
                    placeholder="Descreva brevemente o conteúdo do curso..."
                  />
                </div>
              </div>

              {/* Coluna Direita - Preço e Status */}
              <div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#334155',
                    marginBottom: '6px'
                  }}>
                    Preço (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                    placeholder="0.00"
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
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      appearance: 'none', // Remove a seta padrão do select
                      // Adicione uma seta personalizada se quiser
                      // background: 'white url("data:image/svg+xml;charset=US-ASCII,...") no-repeat right 12px center',
                      backgroundSize: '16px 16px'
                    }}
                  >
                    <option value="draft">Rascunho</option>
                    <option value="published">Publicado</option>
                  </select>
                </div>
              </div>
            </div>
            {/* ✅ FIM DA CORREÇÃO */}

            {/* Botões de Ação */}
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginTop: '24px',
              gap: '12px'
            }}>
              <Link
                href={`/tenant/${subdomain}/courses`} // Volta para a lista de cursos
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
                disabled={loading}
                style={{
                  background: loading ? '#94a3b8' : '#0ea5e9',
                  color: 'white',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontWeight: '500',
                  transition: 'background-color 0.2s'
                }}
              >
                {loading ? 'Criando...' : 'Criar Curso'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}