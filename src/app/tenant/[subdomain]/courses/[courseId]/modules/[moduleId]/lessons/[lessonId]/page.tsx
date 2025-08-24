// src/app/tenant/[subdomain]/courses/[courseId]/modules/[moduleId]/lessons/[lessonId]/page.tsx
import { notFound } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import Link from 'next/link';
import { ContentRenderer } from '@/components/content/ContentRenderer'; // ✅ Importar o novo componente

// Interfaces atualizadas
interface TenantData {
  id: string;
  name: string;
  subdomain: string;
  ownerId: string;
  createdAt: any;
}

interface CourseData {
  id: string;
  title: string;
  description?: string;
  price?: number;
  status: 'published' | 'draft';
  createdAt: any;
  tenantId: string;
}

interface ModuleData {
  id: string;
  title: string;
  description?: string;
  order: number;
  courseId: string;
  createdAt: any;
}

interface LessonData {
  id: string;
  title: string;
  description?: string;
  content?: string; // Este campo vai mudar para suportar conteúdo multimídia
  contentData?: any; // Novo campo para conteúdo estruturado
  order: number;
  moduleId: string;
  type: 'video' | 'text' | 'pdf' | 'code' | string;
  duration?: number;
  createdAt: any;
  updatedAt: any;
}

export default async function LessonViewPage({ params }: { params: Promise<{ subdomain: string; courseId: string; moduleId: string; lessonId: string }> }) {
  const resolvedParams = await params;
  const { subdomain, courseId, moduleId, lessonId } = resolvedParams;

  console.log(`[LessonViewPage] Acessando aula '${lessonId}' do módulo '${moduleId}' do curso '${courseId}' no tenant '${subdomain}'`);

  try {
    // [Mesmo código de validação existente...]
    
    // ✅ PASSO 1-4: Mesmo código de verificação de permissões...

    const lessonData: LessonData = {
      id: lessonSnap.id,
      ...(lessonSnap.data() as Omit<LessonData, 'id'>)
    };

    return (
      <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
        {/* Header - mantido igual */}
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
                  🎓 Visualizar Aula
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
            {/* Informações da Aula */}
            <div style={{
              marginBottom: '24px',
              padding: '20px',
              background: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: '600',
                color: '#1f2937',
                margin: '0 0 12px 0'
              }}>
                {lessonData.title}
              </h2>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '14px',
                color: '#64748b'
              }}>
                <div style={{
                  background: lessonData.type === 'video' ? '#ede9fe' : lessonData.type === 'text' ? '#dcfce7' : lessonData.type === 'pdf' ? '#fef3c7' : '#e5e7eb',
                  color: lessonData.type === 'video' ? '#5b21b6' : lessonData.type === 'text' ? '#166534' : lessonData.type === 'pdf' ? '#92400e' : '#374151',
                  fontSize: '12px',
                  fontWeight: '600',
                  padding: '4px 8px',
                  borderRadius: '12px'
                }}>
                  {lessonData.type}
                </div>
                {lessonData.duration && (
                  <span>
                    Duração: {Math.floor(lessonData.duration / 60)}min {lessonData.duration % 60}s
                  </span>
                )}
              </div>
            </div>

            {/* Conteúdo da Aula - AGORA USANDO O NOVO SISTEMA */}
            <div style={{
              background: 'white',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              overflow: 'hidden',
              minHeight: '300px'
            }}>
              {/* ✅ USANDO O NOVO ContentRenderer */}
              <div style={{ padding: '24px' }}>
                {/* Se tiver o novo conteúdo estruturado */}
                {lessonData.contentData ? (
                  <ContentRenderer content={lessonData.contentData} />
                ) : (
                  /* Conteúdo legado - manter compatibilidade */
                  <>
                    {lessonData.type === 'video' && lessonData.content ? (
                      <div style={{
                        position: 'relative',
                        paddingBottom: '56.25%',
                        height: 0,
                        overflow: 'hidden',
                        borderRadius: '8px'
                      }}>
                        {lessonData.content.includes('youtube.com') || lessonData.content.includes('youtu.be') ? (
                          <iframe
                            src={lessonData.content.replace('watch?v=', 'embed/')}
                            title={lessonData.title}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              border: 'none'
                            }}
                          ></iframe>
                        ) : (
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%',
                            backgroundColor: '#f3f4f6',
                            color: '#6b7280'
                          }}>
                            Player de vídeo para {lessonData.content} não implementado. Insira um link do YouTube.
                          </div>
                        )}
                      </div>
                    ) : lessonData.type === 'text' && lessonData.content ? (
                      <div style={{
                        fontSize: '16px',
                        lineHeight: '1.6',
                        color: '#374151',
                        whiteSpace: 'pre-line'
                      }}>
                        {lessonData.content}
                      </div>
                    ) : lessonData.type === 'pdf' ? (
                      <div style={{
                        textAlign: 'center',
                        padding: '40px 20px',
                        color: '#6b7280'
                      }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📄</div>
                        <p>Visualizador de PDF integrado não implementado.</p>
                        {lessonData.content && (
                          <a
                            href={lessonData.content}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'inline-block',
                              marginTop: '16px',
                              background: '#0ea5e9',
                              color: 'white',
                              padding: '8px 16px',
                              borderRadius: '8px',
                              textDecoration: 'none',
                              fontWeight: '500'
                            }}
                          >
                            Abrir PDF em Nova Aba
                          </a>
                        )}
                      </div>
                    ) : (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '200px',
                        color: '#9ca3af',
                        fontStyle: 'italic'
                      }}>
                        Nenhum conteúdo disponível para esta aula.
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Ações - mantidas iguais */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '24px'
            }}>
              <Link
                href={`/tenant/${subdomain}/courses/${courseId}/modules/${moduleId}/lessons`}
                style={{
                  color: '#0ea5e9',
                  fontWeight: '500',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center'
                }}
              >
                ← Voltar para as aulas
              </Link>
              <Link
                href={`/tenant/${subdomain}/courses/${courseId}/modules/${moduleId}/lessons/edit/${lessonId}`}
                style={{
                  color: '#4f46e5',
                  fontWeight: '500',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center'
                }}
              >
                Editar Aula →
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error(`[LessonViewPage] Erro ao buscar dados da aula '${lessonId}':`, error);
    return notFound();
  }
}