// src/app/tenant/[subdomain]/courses/[courseId]/modules/page.tsx
import { notFound } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import Link from 'next/link';
// import DeleteModuleButton from '@/components/tenant/DeleteModuleButton'; // Mantenha se o componente existir

// Definindo interfaces para tipagem (ajuste conforme seus dados)
interface ModuleData {
  id: string;
  title: string;
  description?: string;
  order: number;
  courseId: string;
  createdAt: any;
  // ... outros campos
}

export default async function CourseModulesPage({ params }: { params: Promise<{ subdomain: string; courseId: string }> }) {
  const { subdomain, courseId } = await params;

  console.log(`[CourseModulesPage] Acessando módulos para o curso: ${courseId} no tenant: ${subdomain}`);

  try {
    // ✅ PASSO 1: Buscar o tenant pelo subdomain para obter seu ID REAL
    const tenantsCollection = collection(db, 'tenants');
    const tenantQuery = query(tenantsCollection, where('subdomain', '==', subdomain));
    const tenantSnapshot = await getDocs(tenantQuery);

    if (tenantSnapshot.empty) {
      console.log(`[CourseModulesPage] Tenant com subdomain '${subdomain}' não encontrado.`);
      return notFound();
    }

    const tenantDoc = tenantSnapshot.docs[0];
    const tenantData = {
      id: tenantDoc.id,
      ...(tenantDoc.data() as { [key: string]: any })
    };

    // ✅ PASSO 2: Verificar se o curso existe e pertence AO TENANT (usando o ID real do tenant)
    const courseRef = doc(db, 'courses', courseId);
    const courseSnap = await getDoc(courseRef);

    if (!courseSnap.exists()) {
      console.log(`[CourseModulesPage] Curso '${courseId}' não encontrado.`);
      return notFound();
    }

    const courseData = {
      id: courseSnap.id,
      ...(courseSnap.data() as { [key: string]: any })
    };

    // Verifica se o tenantId do curso corresponde ao ID do tenant encontrado
    if (courseData.tenantId !== tenantData.id) {
      console.log(`[CourseModulesPage] Curso '${courseId}' não pertence ao tenant '${subdomain}' (ID: ${tenantData.id}).`);
      return notFound();
    }

    // ✅ PASSO 3: Buscar os módulos do curso, ordenados por 'order'
    const modulesQuery = query(
      collection(db, 'modules'),
      where('courseId', '==', courseId),
      orderBy('order', 'asc')
    );
    const modulesSnapshot = await getDocs(modulesQuery);

    const modules: ModuleData[] = modulesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Omit<ModuleData, 'id'>)
    }));

    console.log(`[CourseModulesPage] Encontrados ${modules.length} módulos para o curso '${courseId}'.`);

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
                  📚 Gerenciar Módulos
                </h1>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
              }}>
                <Link
                  href={`/tenant/${subdomain}/courses`} // Voltar para a lista de cursos
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
              <h2 style={{
                fontSize: '24px',
                fontWeight: '600',
                color: '#1f2937',
                margin: '0'
              }}>
                Gerenciar Módulos
              </h2>
              <Link
                href={`/tenant/${subdomain}/courses/${courseId}/modules/create`} // ✅ Caminho ajustado
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
                + Criar Novo Módulo
              </Link>
            </div>

            {modules.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '48px 24px',
                background: '#f8fafc',
                borderRadius: '8px',
                border: '1px dashed #cbd5e1'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📂</div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#334155',
                  margin: '0 0 8px 0'
                }}>
                  Nenhum módulo criado ainda
                </h3>
                <p style={{
                  color: '#64748b',
                  margin: '0 0 24px 0'
                }}>
                  Comece criando seu primeiro módulo para este curso.
                </p>
                <Link
                  href={`/tenant/${subdomain}/courses/${courseId}/modules/create`} // ✅ Caminho ajustado
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
                  Criar Primeiro Módulo
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
                  {modules.map((module) => (
                    <li key={module.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <div style={{ padding: '20px 24px' }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: '12px'
                        }}>
                          <div>
                            <Link
                              href={`/tenant/${subdomain}/courses/${courseId}/modules/${module.id}/lessons`} // ✅ Caminho ajustado
                              style={{
                                fontSize: '16px',
                                fontWeight: '600',
                                color: '#2563eb',
                                textDecoration: 'none',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}
                            >
                              {module.title}
                            </Link>
                            {module.description && (
                              <div style={{
                                fontSize: '14px',
                                color: '#6b7280',
                                marginTop: '4px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}>
                                {module.description}
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
                              background: '#dcfce7',
                              color: '#166534',
                              fontSize: '12px',
                              fontWeight: '600',
                              padding: '4px 8px',
                              borderRadius: '12px'
                            }}>
                              Publicado
                            </div>
                            <div style={{
                              fontSize: '12px',
                              color: '#9ca3af'
                            }}>
                              Criado em: {module.createdAt?.toDate?.().toLocaleDateString('pt-BR') || 'Data não disponível'}
                            </div>
                          </div>
                        </div>
                        <div style={{
                          display: 'flex',
                          gap: '12px',
                          marginTop: '8px'
                        }}>
                          <Link
                            href={`/tenant/${subdomain}/courses/${courseId}/modules/${module.id}/lessons`} // ✅ Caminho ajustado
                            style={{
                              color: '#0ea5e9',
                              fontWeight: '500',
                              textDecoration: 'none',
                              fontSize: '14px'
                            }}
                          >
                            Gerenciar Conteúdo
                          </Link>
                          <Link
                            href={`/tenant/${subdomain}/courses/${courseId}/modules/edit/${module.id}`} // ✅ Caminho ajustado
                            style={{
                              color: '#4f46e5',
                              fontWeight: '500',
                              textDecoration: 'none',
                              fontSize: '14px'
                            }}
                          >
                            Editar
                          </Link>
                          {/* Se DeleteModuleButton existir e usar estilos inline, mantenha. Senão, comente ou remova */}
                          {/* <DeleteModuleButton moduleId={module.id} courseId={courseId} subdomain={subdomain} /> */}
                          <button
                            disabled
                            style={{
                              color: '#9ca3af',
                              fontWeight: '500',
                              background: 'none',
                              border: 'none',
                              cursor: 'not-allowed',
                              padding: 0,
                              fontSize: '14px'
                            }}
                          >
                            Excluir
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* ✅ ALTERAÇÃO: Removido o link "Voltar para a lista de cursos" daqui */}
            {/* A navegação principal agora é feita pelo botão "Voltar" no cabeçalho */}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error(`[CourseModulesPage] Erro ao buscar dados do curso '${courseId}' ou módulos:`, error);
    return notFound(); // ou return <div style={{ padding: '20px' }}>Erro interno do servidor</div>;
  }
}