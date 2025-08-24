// src/app/tenant/[subdomain]/courses/[courseId]/modules/[moduleId]/lessons/page.tsx
import { notFound } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import Link from 'next/link';
import DeleteLessonButton from './DeleteLessonButton'; // ✅ Importar o componente

// Definindo interfaces para tipagem
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
  order: number;
  moduleId: string;
  type: 'video' | 'text' | string;
  duration?: number;
  createdAt: any;
}

export default async function ModuleLessonsPage({ params }: { params: Promise<{ subdomain: string; courseId: string; moduleId: string }> }) {
  const resolvedParams = await params;
  const { subdomain, courseId, moduleId } = resolvedParams;

  console.log(`[ModuleLessonsPage] Acessando aulas para o módulo: ${moduleId} do curso: ${courseId} no tenant: ${subdomain}`);

  try {
    // ✅ PASSO 1: Buscar o tenant pelo subdomain para obter seu ID REAL
    const tenantsCollection = collection(db, 'tenants');
    const tenantQuery = query(tenantsCollection, where('subdomain', '==', subdomain));
    const tenantSnapshot = await getDocs(tenantQuery);

    if (tenantSnapshot.empty) {
      console.log(`[ModuleLessonsPage] Tenant com subdomain '${subdomain}' não encontrado.`);
      return notFound();
    }

    const tenantDoc = tenantSnapshot.docs[0];
    const tenantData: TenantData = {
      id: tenantDoc.id,
      ...(tenantDoc.data() as Omit<TenantData, 'id'>)
    };

    // ✅ PASSO 2: Verificar se o módulo existe
    const moduleRef = doc(db, 'modules', moduleId);
    const moduleSnap = await getDoc(moduleRef);

    if (!moduleSnap.exists()) {
      console.log(`[ModuleLessonsPage] Módulo '${moduleId}' não encontrado.`);
      return notFound();
    }

    const moduleData: ModuleData = {
      id: moduleSnap.id,
      ...(moduleSnap.data() as Omit<ModuleData, 'id'>)
    };

    // Verificar se o módulo pertence ao curso especificado
    if (moduleData.courseId !== courseId) {
      console.log(`[ModuleLessonsPage] Módulo '${moduleId}' não pertence ao curso '${courseId}'.`);
      return notFound();
    }

    // ✅ PASSO 3: Verificar se o curso existe e pertence AO TENANT
    const courseRef = doc(db, 'courses', courseId);
    const courseSnap = await getDoc(courseRef);

    if (!courseSnap.exists()) {
      console.log(`[ModuleLessonsPage] Curso '${courseId}' não encontrado.`);
      return notFound();
    }

    const courseData: CourseData = {
      id: courseSnap.id,
      ...(courseSnap.data() as Omit<CourseData, 'id'>)
    };

    // Verifica se o tenantId do curso corresponde ao ID do tenant encontrado
    if (courseData.tenantId !== tenantData.id) {
      console.log(`[ModuleLessonsPage] Curso '${courseId}' não pertence ao tenant '${subdomain}' (ID: ${tenantData.id}).`);
      return notFound();
    }

    // ✅ PASSO 4: Buscar as aulas do módulo, ordenadas por 'order'
    const lessonsQuery = query(
      collection(db, 'lessons'),
      where('moduleId', '==', moduleId),
      orderBy('order', 'asc')
    );
    const lessonsSnapshot = await getDocs(lessonsQuery);

    const lessons: LessonData[] = lessonsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Omit<LessonData, 'id'>)
    }));

    console.log(`[ModuleLessonsPage] Encontradas ${lessons.length} aulas para o módulo '${moduleId}'.`);

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
                  🎓 Gerenciar Aulas
                </h1>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
              }}>
                <Link
                  href={`/tenant/${subdomain}/courses/${courseId}/modules`}
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
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <div>
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: '600',
                  color: '#1f2937',
                  margin: '0 0 8px 0'
                }}>
                  Aulas - {moduleData.title}
                </h2>
                <p style={{
                  color: '#64748b',
                  margin: 0
                }}>
                  Curso: {courseData.title}
                </p>
              </div>
              <Link
                href={`/tenant/${subdomain}/courses/${courseId}/modules/${moduleId}/lessons/create`}
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
                + Criar Nova Aula
              </Link>
            </div>

            {lessons.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '48px 24px',
                background: '#f8fafc',
                borderRadius: '8px',
                border: '1px dashed #cbd5e1'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📘</div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#334155',
                  margin: '0 0 8px 0'
                }}>
                  Nenhuma aula criada ainda
                </h3>
                <p style={{
                  color: '#64748b',
                  margin: '0 0 24px 0'
                }}>
                  Comece criando sua primeira aula para este módulo.
                </p>
                <Link
                  href={`/tenant/${subdomain}/courses/${courseId}/modules/${moduleId}/lessons/create`}
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
                  Criar Primeira Aula
                </Link>
              </div>
            ) : (
              <div style={{
                background: 'white',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                overflow: 'hidden'
              }}>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {lessons.map((lesson) => (
                    <li key={lesson.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <div style={{ padding: '20px 24px' }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: '12px'
                        }}>
                          <div>
                            <Link
                              href={`/tenant/${subdomain}/courses/${courseId}/modules/${moduleId}/lessons/${lesson.id}`}
                              style={{
                                fontSize: '16px',
                                fontWeight: '600',
                                color: '#2563eb',
                                textDecoration: 'none',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}
                            >
                              {lesson.title}
                            </Link>
                            {lesson.description && (
                              <div style={{
                                fontSize: '14px',
                                color: '#6b7280',
                                marginTop: '4px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}>
                                {lesson.description}
                              </div>
                            )}
                          </div>
                          <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-end',
                            gap: '8px'
                          }}>
                            <div style={{
                              background: lesson.type === 'video' ? '#ede9fe' : lesson.type === 'text' ? '#dcfce7' : '#fef3c7',
                              color: lesson.type === 'video' ? '#5b21b6' : lesson.type === 'text' ? '#166534' : '#92400e',
                              fontSize: '12px',
                              fontWeight: '600',
                              padding: '4px 8px',
                              borderRadius: '12px'
                            }}>
                              {lesson.type}
                            </div>
                            <div style={{
                              fontSize: '12px',
                              color: '#9ca3af'
                            }}>
                              {lesson.duration ? `Duração: ${Math.floor(lesson.duration / 60)}min ${lesson.duration % 60}s` : 'Duração não definida'}
                            </div>
                          </div>
                        </div>
                        <div style={{
                          display: 'flex',
                          gap: '12px',
                          marginTop: '8px'
                        }}>
                          <Link
                            href={`/tenant/${subdomain}/courses/${courseId}/modules/${moduleId}/lessons/edit/${lesson.id}`}
                            style={{
                              color: '#4f46e5',
                              fontWeight: '500',
                              textDecoration: 'none',
                              fontSize: '14px'
                            }}
                          >
                            Editar
                          </Link>
                          {/* ✅ BOTÃO DE EXCLUSÃO */}
                          <DeleteLessonButton 
                            lessonId={lesson.id}
                            moduleId={moduleId}
                            courseId={courseId}
                            subdomain={subdomain}
                            lessonTitle={lesson.title}
                          />
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error(`[ModuleLessonsPage] Erro ao buscar dados do módulo '${moduleId}', curso '${courseId}' ou aulas:`, error);
    return notFound();
  }
}