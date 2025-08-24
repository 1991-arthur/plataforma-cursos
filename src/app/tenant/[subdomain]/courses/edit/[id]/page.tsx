// src/app/tenant/[subdomain]/courses/edit/[id]/page.tsx
'use client';

// ✅ CORREÇÃO 1: Importação de React no início
import * as React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import Link from 'next/link'; // Para o link de voltar no header

export default function EditCoursePage({ params }: { params: Promise<{ subdomain: string; id: string }> }) {
  // ✅ CORREÇÃO 2: React.use no início do componente
  const resolvedParams = React.use(params);
  const { subdomain, id } = resolvedParams;
  
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [status, setStatus] = useState('draft');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // Tipagem explícita
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null); // Para feedback de sucesso
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!id) {
        setError('ID do curso não fornecido.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log(`[EditCoursePage] Buscando dados do curso com ID: ${id}`);

        const courseRef = doc(db, 'courses', id);
        const courseSnap = await getDoc(courseRef);

        if (courseSnap.exists()) {
          const data = courseSnap.data();
          console.log(`[EditCoursePage] Dados do curso carregados:`, data);
          setTitle(data.title || '');
          setDescription(data.description || '');
          // Converte o preço para string, garantindo que seja um número válido
          setPrice(data.price !== undefined && data.price !== null ? data.price.toString() : '');
          setStatus(data.status || 'draft');
        } else {
          console.log(`[EditCoursePage] Curso com ID '${id}' não encontrado.`);
          setError('Curso não encontrado.');
        }
      } catch (err: any) {
        console.error('[EditCoursePage] Erro ao buscar curso:', err);
        setError('Falha ao carregar os dados do curso.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setMessage({ type: 'error', text: 'O título do curso é obrigatório.' });
      return;
    }

    setSubmitting(true);
    setMessage(null);
    setError(null);

    try {
      console.log(`[EditCoursePage] Atualizando curso com ID: ${id}`);
      const courseRef = doc(db, 'courses', id);
      await updateDoc(courseRef, {
        title: title.trim(),
        description: description.trim(),
        price: price ? parseFloat(price) : 0,
        status,
        updatedAt: serverTimestamp(),
      });

      console.log('[EditCoursePage] ✅ Curso atualizado com sucesso!');
      setMessage({ type: 'success', text: 'Curso atualizado com sucesso!' });
      // Opcional: Atualizar o estado local se quiser manter na página
      // router.refresh(); // Se estiver usando Server Components para partes da página
      
      // Redireciona para a lista de cursos após um breve delay para mostrar a mensagem
       setTimeout(() => {
         router.push(`/tenant/${subdomain}/courses`);
       }, 1500); 

    } catch (err: any) {
      console.error('[EditCoursePage] ❌ Erro ao atualizar curso:', err);
      setMessage({ type: 'error', text: 'Falha ao atualizar o curso. Tente novamente.' });
    } finally {
      setSubmitting(false);
    }
  };

  // --- Estados de Carregamento e Erro ---
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
          Carregando dados do curso...
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
              href={`/tenant/${subdomain}/courses`}
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
              Ir para Cursos
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // --- Página Principal ---
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
                🛠️ Editar Curso
              </h1>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              <Link
                href={`/tenant/${subdomain}/courses`}
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
                      background: 'white url("data:image/svg+xml;charset=US-ASCII,...") no-repeat right 12px center', // Adicione uma seta personalizada se quiser
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
                href={`/tenant/${subdomain}/courses`}
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
                disabled={submitting}
                style={{
                  background: submitting ? '#94a3b8' : '#0ea5e9',
                  color: 'white',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  fontWeight: '500',
                  transition: 'background-color 0.2s'
                }}
              >
                {submitting ? 'Atualizando...' : 'Atualizar Curso'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}