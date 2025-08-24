// src/app/tenant/[subdomain]/courses/[courseId]/modules/[moduleId]/lessons/[lessonId]/page.tsx
import { notFound } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs, Timestamp, orderBy } from 'firebase/firestore';
import Link from 'next/link';
import { ContentRenderer } from '@/components/content/ContentRenderer';
import LessonProgressButton from '@/components/lesson/LessonProgressButton';
import { getTotalLessonsInCourse } from '@/lib/progress';

// Função para converter timestamps do Firebase em datas simples
function convertFirebaseData(data: any): any {
  if (!data) return data;
  
  // Se for um objeto Timestamp do Firebase
  if (data instanceof Timestamp) {
    return new Date(data.seconds * 1000 + Math.floor(data.nanoseconds / 1000000));
  }
  
  // Se for um objeto com propriedades de Timestamp
  if (data.seconds !== undefined && data.nanoseconds !== undefined) {
    return new Date(data.seconds * 1000 + Math.floor(data.nanoseconds / 1000000));
  }
  
  // Se for um objeto, percorrer recursivamente
  if (typeof data === 'object' && data !== null) {
    if (Array.isArray(data)) {
      return data.map(item => convertFirebaseData(item));
    }
    
    const converted: any = {};
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        converted[key] = convertFirebaseData(data[key]);
      }
    }
    return converted;
  }
  
  return data;
}

// Definindo interfaces para tipagem
interface TenantData {
  id: string;
  name: string;
  subdomain: string;
  ownerId: string;
  createdAt: Date;
}

interface CourseData {
  id: string;
  title: string;
  description?: string;
  price?: number;
  status: 'published' | 'draft';
  createdAt: Date;
  tenantId: string;
}

interface ModuleData {
  id: string;
  title: string;
  description?: string;
  order: number;
  courseId: string;
  createdAt: Date;
}

interface LessonData {
  id: string;
  title: string;
  description?: string;
  content?: any;
  contentData?: any;
  order: number;
  moduleId: string;
  courseId: string;
  type: 'video' | 'text' | 'pdf' | 'code' | string;
  duration?: number;
  createdAt: Date;
  updatedAt: Date;
}

export default async function LessonViewPage({ params }: { params: Promise<{ subdomain: string; courseId: string; moduleId: string; lessonId: string }> }) {
  const resolvedParams = await params;
  const { subdomain, courseId, moduleId, lessonId } = resolvedParams;

  console.log(`[LessonViewPage] Acessando aula '${lessonId}' do módulo '${moduleId}' do curso '${courseId}' no tenant '${subdomain}'`);

  try {
    // ✅ PASSO 1: Buscar o tenant pelo subdomain para obter seu ID REAL
    const tenantsCollection = collection(db, 'tenants');
    const tenantQuery = query(tenantsCollection, where('subdomain', '==', subdomain));
    const tenantSnapshot = await getDocs(tenantQuery);

    if (tenantSnapshot.empty) {
      console.log(`[LessonViewPage] Tenant com subdomain '${subdomain}' não encontrado.`);
      return notFound();
    }

    const tenantDoc = tenantSnapshot.docs[0];
    const tenantData: TenantData = {
      id: tenantDoc.id,
      ...(convertFirebaseData(tenantDoc.data()) as Omit<TenantData, 'id'>)
    };

    // ✅ PASSO 2: Verificar se o curso existe e pertence AO TENANT
    const courseRef = doc(db, 'courses', courseId);
    const courseSnap = await getDoc(courseRef);

    if (!courseSnap.exists()) {
      console.log(`[LessonViewPage] Curso '${courseId}' não encontrado.`);
      return notFound();
    }

    const courseData: CourseData = {
      id: courseSnap.id,
      ...(convertFirebaseData(courseSnap.data()) as Omit<CourseData, 'id'>)
    };

    // Verifica se o tenantId do curso corresponde ao ID do tenant encontrado
    if (courseData.tenantId !== tenantData.id) {
      console.log(`[LessonViewPage] Curso '${courseId}' não pertence ao tenant '${subdomain}' (ID: ${tenantData.id}).`);
      return notFound();
    }

    // ✅ PASSO 3: Verificar se o módulo existe e pertence AO CURSO
    const moduleRef = doc(db, 'modules', moduleId);
    const moduleSnap = await getDoc(moduleRef);

    if (!moduleSnap.exists()) {
      console.log(`[LessonViewPage] Módulo '${moduleId}' não encontrado.`);
      return notFound();
    }

    const moduleData: ModuleData = {
      id: moduleSnap.id,
      ...(convertFirebaseData(moduleSnap.data()) as Omit<ModuleData, 'id'>)
    };

    // Verifica se o courseId do módulo corresponde ao ID do curso encontrado
    if (moduleData.courseId !== courseData.id) {
      console.log(`[LessonViewPage] Módulo '${moduleId}' não pertence ao curso '${courseId}'.`);
      return notFound();
    }

    // ✅ PASSO 4: Verificar se a aula existe e pertence AO MÓDULO
    const lessonRef = doc(db, 'lessons', lessonId);
    const lessonSnap = await getDoc(lessonRef);

    if (!lessonSnap.exists()) {
      console.log(`[LessonViewPage] Aula '${lessonId}' não encontrada.`);
      return notFound();
    }

    const lessonData: LessonData = {
      id: lessonSnap.id,
      ...(convertFirebaseData(lessonSnap.data()) as Omit<LessonData, 'id'>)
    };

    // Verifica se o moduleId da aula corresponde ao ID do módulo encontrado
    if (lessonData.moduleId !== moduleData.id) {
      console.log(`[LessonViewPage] Aula '${lessonId}' não pertence ao módulo '${moduleId}'.`);
      return notFound();
    }

    // ✅ PASSO 5: Obter todas as aulas do módulo ordenadas por ordem
    const lessonsQuery = query(
      collection(db, 'lessons'),
      where('moduleId', '==', moduleId),
      orderBy('order', 'asc')
    );
    const lessonsSnapshot = await getDocs(lessonsQuery);
    
    const lessons: LessonData[] = lessonsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...(convertFirebaseData(doc.data()) as Omit<LessonData, 'id'>)
    }));

    // ✅ PASSO 6: Encontrar a aula anterior e próxima
    const currentLessonIndex = lessons.findIndex(lesson => lesson.id === lessonId);
    const previousLesson = currentLessonIndex > 0 ? lessons[currentLessonIndex - 1] : null;
    const nextLesson = currentLessonIndex < lessons.length - 1 ? lessons[currentLessonIndex + 1] : null;

    // ✅ PASSO 7: Obter o número total de aulas no curso
    const totalLessonsInCourse = await getTotalLessonsInCourse(courseId);

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
                  background: lessonData.type === 'video' ? '#ede9fe' : lessonData.type === 'text' ? '#dcfce7' : lessonData.type === 'code' ? '#fef3c7' : lessonData.type === 'pdf' ? '#e0f2fe' : '#e5e7eb',
                  color: lessonData.type === 'video' ? '#5b21b6' : lessonData.type === 'text' ? '#166534' : lessonData.type === 'code' ? '#92400e' : lessonData.type === 'pdf' ? '#0369a1' : '#374151',
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

            {/* Conteúdo da Aula */}
            <div style={{
              background: 'white',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              overflow: 'hidden',
              minHeight: '300px'
            }}>
              <div style={{ padding: '24px' }}>
                {/* ✅ USANDO O NOVO ContentRenderer com dados convertidos */}
                {lessonData.content ? (
                  <ContentRenderer content={lessonData.content} />
                ) : lessonData.contentData ? (
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
                    ) : lessonData.type === 'code' && lessonData.content ? (
                      <div style={{
                        background: '#1e1e1e',
                        color: '#d4d4d4',
                        padding: '16px',
                        borderRadius: '4px',
                        fontFamily: 'monospace',
                        overflow: 'auto'
                      }}>
                        <pre style={{ margin: 0 }}><code>{lessonData.content}</code></pre>
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

            {/* ✅ Componente Cliente para o Botão de Progresso */}
            <LessonProgressButton 
              userId="user-temporario"
              courseId={courseId}
              lessonId={lessonId}
              lessonTitle={lessonData.title}
              moduleName={moduleData.title}
              totalLessonsInCourse={totalLessonsInCourse}
            />

            {/* ✅ Navegação entre aulas - SEM EVENT HANDLERS */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '24px',
              padding: '16px 0',
              borderTop: '1px solid #e5e7eb'
            }}>
              {previousLesson ? (
                <Link
                  href={`/tenant/${subdomain}/courses/${courseId}/modules/${moduleId}/lessons/${previousLesson.id}`}
                  style={{
                    color: '#0ea5e9',
                    fontWeight: '500',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: '1px solid #0ea5e9',
                    transition: 'all 0.2s',
                    backgroundColor: 'transparent'
                  }}
                >
                  ← Aula Anterior: {previousLesson.title}
                </Link>
              ) : (
                <div></div>
              )}
              
              {nextLesson ? (
                <Link
                  href={`/tenant/${subdomain}/courses/${courseId}/modules/${moduleId}/lessons/${nextLesson.id}`}
                  style={{
                    color: '#0ea5e9',
                    fontWeight: '500',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: '1px solid #0ea5e9',
                    transition: 'all 0.2s',
                    backgroundColor: 'transparent'
                  }}
                >
                  Próxima Aula: {nextLesson.title} →
                </Link>
              ) : (
                <div style={{
                  color: '#10b981',
                  fontWeight: '500',
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: '1px solid #10b981',
                  backgroundColor: '#dcfce7'
                }}>
                  🎉 Módulo Concluído!
                </div>
              )}
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