// src/app/tenant/[subdomain]/courses/[courseId]/modules/[moduleId]/lessons/edit/[id]/page.tsx
'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import Link from 'next/link';

export default function EditLessonPage({ params }: { params: Promise<{ subdomain: string; courseId: string; moduleId: string; id: string }> }) {
  const router = useRouter();
  const { subdomain, courseId, moduleId, id } = React.use(params);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState('text');
  const [order, setOrder] = useState(1);
  const [duration, setDuration] = useState(''); // Em minutos
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const lessonRef = doc(db, 'lessons', id);
        const lessonSnap = await getDoc(lessonRef);

        if (lessonSnap.exists() && lessonSnap.data().moduleId === moduleId) {
          const data = lessonSnap.data();
          setTitle(data.title || '');
          setContent(data.content || '');
          setType(data.type || 'text');
          setOrder(data.order || 1);
          if (data.duration) {
            setDuration(Math.floor(data.duration / 60).toString()); // Converter segundos para minutos
          }
        } else {
          setMessage({ type: 'error', text: 'Aula não encontrada ou não pertence a este módulo.' });
        }
      } catch (err) {
        console.error('Erro ao buscar aula:', err);
        setMessage({ type: 'error', text: 'Falha ao carregar os dados da aula.' });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchLesson();
    }
  }, [id, moduleId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setMessage({ type: 'error', text: 'O título da aula é obrigatório.' });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const durationInSeconds = duration ? parseInt(duration, 10) * 60 : 0;

      const lessonRef = doc(db, 'lessons', id);
      await updateDoc(lessonRef, {
        title: title.trim(),
        content: content.trim(),
        type,
        order: parseInt(order.toString(), 10),
        duration: durationInSeconds || null,
        updatedAt: serverTimestamp(),
      });

      console.log('✅ Aula atualizada com sucesso!');
      setMessage({ type: 'success', text: `Aula "${title}" atualizada com sucesso!` });
      
      // Redireciona após breve delay
      setTimeout(() => {
        router.push(`/tenant/${subdomain}/courses/${courseId}/modules/${moduleId}/lessons`);
      }, 1500);

    } catch (err) {
      console.error('❌ Erro ao atualizar aula:', err);
      setMessage({ type: 'error', text: 'Falha ao atualizar a aula. Tente novamente.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Carregando dados da aula...</p>
      </div>
    );
  }

  if (message?.type === 'error' && !title) {
    return (
      <div style={{ minHeight: '100vh', background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '24px',
            background: '#fee2e2',
            border: '1px solid #fecaca',
            color: '#991b1b'
          }}>
            {message.text}
          </div>
          <button
            onClick={() => router.back()}
            style={{
              background: '#e2e8f0',
              color: '#334155',
              padding: '10px 16px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      {/* Header - Mantendo consistência com outras páginas */}
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
                ✏️ Editar Aula
              </h1>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              <Link
                href={`/tenant/${subdomain}/courses/${courseId}/modules/${moduleId}/lessons`}
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
            Informações da Aula
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
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '20px'
            }}>
              {/* Coluna Esquerda - Título e Tipo */}
              <div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#334155',
                    marginBottom: '6px'
                  }}>
                    Título da Aula *
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
                    placeholder="Ex: Introdução ao Next.js App Router"
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
                    Tipo de Conteúdo
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      appearance: 'none'
                    }}
                  >
                    <option value="text">Texto</option>
                    <option value="video">Vídeo</option>
                    <option value="pdf">PDF</option>
                    <option value="quiz">Quiz</option>
                  </select>
                </div>
              </div>

              {/* Coluna Direita - Ordem e Duração */}
              <div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#334155',
                    marginBottom: '6px'
                  }}>
                    Ordem de Exibição
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={order}
                    onChange={(e) => setOrder(parseInt(e.target.value) || 1)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
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
                    Duração (minutos)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                    placeholder="Ex: 15"
                  />
                </div>
              </div>

              {/* Conteúdo - Full width */}
              <div style={{ gridColumn: '1 / -1' }}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#334155',
                    marginBottom: '6px'
                  }}>
                    Conteúdo
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
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
                    placeholder={type === 'video' ? 'URL do vídeo (YouTube, Vimeo, etc.)' : type === 'text' ? 'Digite o conteúdo da aula...' : 'Informações adicionais...'}
                  />
                  <div style={{
                    marginTop: '6px',
                    fontSize: '12px',
                    color: '#64748b'
                  }}>
                    {type === 'video' ? 'Cole o link completo do vídeo.' : 'Insira o conteúdo textual da aula.'}
                  </div>
                </div>
              </div>
            </div>

            {/* Botões de Ação */}
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginTop: '24px',
              gap: '12px'
            }}>
              <Link
                href={`/tenant/${subdomain}/courses/${courseId}/modules/${moduleId}/lessons`}
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
                {submitting ? 'Atualizando...' : 'Atualizar Aula'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}