// src/app/tenant/[subdomain]/courses/[courseId]/modules/[id]/lessons/[lessonId]/page.tsx
// (Note a mudança no caminho do arquivo refletindo a nova estrutura sem /dashboard)
import { notFound } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import Link from 'next/link';

// Definindo interfaces para tipagem (ajuste conforme seus dados)
interface TenantData {
  id: string;
  name: string;
  subdomain: string;
  ownerId: string;
  createdAt: any;
  // settings?: { ... };
}

interface CourseData {
  id: string;
  title: string;
  description?: string;
  price?: number;
  status: 'published' | 'draft';
  createdAt: any;
  tenantId: string; // ID do documento do tenant no Firestore
  // ... outros campos
}

interface ModuleData {
  id: string;
  title: string;
  description?: string;
  order: number;
  courseId: string;
  createdAt: any;
  // ... outros campos
}

interface LessonData {
  id: string;
  title: string;
  description?: string;
  content?: string; // URL para vídeo, texto puro, link para PDF, etc.
  order: number;
  moduleId: string;
  type: 'video' | 'text' | 'pdf' | string; // Ajuste conforme os tipos possíveis
  duration?: number; // Em segundos
  createdAt: any;
  // ... outros campos
}

export default async function LessonViewPage({ params }: { params: Promise<{ subdomain: string; courseId: string; id: string; lessonId: string }> }) {
  // ✅ CORREÇÃO 1: O tipo agora reflete que o parâmetro dinâmico para o módulo é 'id'
  // ✅ CORREÇÃO 2: Desestruturamos 'id' e o renomeamos para 'moduleId' para manter a lógica
  const { subdomain, courseId, id: moduleId, lessonId } = await params;

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
      ...(tenantDoc.data() as Omit<TenantData, 'id'>)
    };

    // ✅ PASSO 2: Verificar se o curso existe e pertence AO TENANT (usando o ID real do tenant)
    const courseRef = doc(db, 'courses', courseId);
    const courseSnap = await getDoc(courseRef);

    if (!courseSnap.exists()) {
      console.log(`[LessonViewPage] Curso '${courseId}' não encontrado.`);
      return notFound();
    }

    const courseData: CourseData = {
      id: courseSnap.id,
      ...(courseSnap.data() as Omit<CourseData, 'id'>)
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
      ...(moduleSnap.data() as Omit<ModuleData, 'id'>)
    };

    // Verifica se o courseId do módulo corresponde ao ID do curso encontrado
    if (moduleData.courseId !== courseData.id) {
      console.log(`[LessonViewPage] Módulo '${moduleId}' não pertence ao curso '${courseId}'.`);
      return notFound();
    }

    // ✅ PASSO 4: Verificar se a aula existe e pertence AO MÓDULO
    // ✅ CORREÇÃO 3: Usamos 'moduleId' (que veio de 'id') para verificar a propriedade da aula
    const lessonRef = doc(db, 'lessons', lessonId);
    const lessonSnap = await getDoc(lessonRef);

    if (!lessonSnap.exists()) {
      console.log(`[LessonViewPage] Aula '${lessonId}' não encontrada.`);
      return notFound();
    }

    const lessonData: LessonData = {
      id: lessonSnap.id,
      ...(lessonSnap.data() as Omit<LessonData, 'id'>)
    };

    // Verifica se o moduleId da aula corresponde ao ID do módulo encontrado
    if (lessonData.moduleId !== moduleData.id) {
      console.log(`[LessonViewPage] Aula '${lessonId}' não pertence ao módulo '${moduleId}'.`);
      return notFound();
    }

    // A verificação lessonData.courseId !== courseId foi removida, pois a aula não precisa ter courseId diretamente.
    // A propriedade é verificada indiretamente através do módulo.

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
                  🎓 Visualizar Aula
                </h1>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
              }}>
                <Link
                  href={`/tenant/${subdomain}/courses/${courseId}/modules/${moduleId}/lessons`} // ✅ Caminho ajustado
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
          maxWidth: '1200px', // Aumentado para melhor visualização do conteúdo
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

            {/* Conteúdo da Aula */}
            <div style={{
              background: 'white',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              overflow: 'hidden',
              minHeight: '300px' // Altura mínima para consistência
            }}>
              {/* Área de Conteúdo */}
              <div style={{ padding: '24px' }}>
                {lessonData.type === 'video' && lessonData.content ? (
                  <div style={{
                    position: 'relative',
                    paddingBottom: '56.25%', /* 16:9 Aspect Ratio */
                    height: 0,
                    overflow: 'hidden',
                    borderRadius: '8px'
                  }}>
                    {/* Exemplo para YouTube. Adapte conforme o tipo de vídeo */}
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
                    whiteSpace: 'pre-line' // Preserva quebras de linha
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
              </div>
            </div>

            {/* Ações */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '24px'
            }}>
              <Link
                href={`/tenant/${subdomain}/courses/${courseId}/modules/${moduleId}/lessons`} // ✅ Caminho ajustado
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
                href={`/tenant/${subdomain}/courses/${courseId}/modules/${moduleId}/lessons/edit/${lessonId}`} // ✅ Caminho ajustado
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
    // Em caso de erro interno, retorna 404 ou uma página de erro genérica
    return notFound(); // ou return <div style={{ padding: '20px' }}>Erro interno do servidor</div>;
  }
}