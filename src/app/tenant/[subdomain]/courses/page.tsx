// src/app/tenant/[subdomain]/courses/page.tsx
import { notFound } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, getDoc, orderBy } from 'firebase/firestore';
import Link from 'next/link';
// ✅ 1. Importar a Server Action
import { deleteCourseAction } from '@/app/actions/courseActions';

// Definindo interfaces para tipagem (ajuste conforme seus dados)
interface TenantData {
  id: string;
  name: string;
  subdomain: string;
  ownerId: string;
  createdAt: any; // Timestamp
  // settings?: { ... };
}

interface CourseData {
  id: string;
  title: string;
  description?: string;
  price?: number;
  status: 'published' | 'draft'; // ou string
  createdAt: any; // Timestamp
  tenantId: string; // ID do tenant ao qual o curso pertence
  // ... outros campos
}

export default async function CoursesPage({ params }: { params: Promise<{ subdomain: string }> }) {
  const { subdomain } = await params;

  console.log(`[CoursesPage] Acessando cursos para o tenant: ${subdomain}`);

  // Verifica se o subdomínio é válido
  if (['admin', 'auth', 'www', 'api', '_next'].includes(subdomain)) {
    console.log(`[CoursesPage] Subdomínio '${subdomain}' é reservado.`);
    return notFound();
  }

  // Busca o documento do tenant no Firestore com base no subdomain
  try {
    // ✅ CONSULTA CORRIGIDA: Buscar pelo campo 'subdomain'
    const tenantsCollection = collection(db, 'tenants');
    const tenantQuery = query(tenantsCollection, where('subdomain', '==', subdomain));
    const tenantSnapshot = await getDocs(tenantQuery);

    if (tenantSnapshot.empty) {
      console.log(`[CoursesPage] Tenant com subdomain '${subdomain}' não encontrado no Firestore.`);
      return notFound();
    }

    // Assumindo subdomínios únicos, pega o primeiro (e único) resultado
    const tenantDoc = tenantSnapshot.docs[0];
    const tenantData: TenantData = {
      id: tenantDoc.id,
      ...(tenantDoc.data() as Omit<TenantData, 'id'>)
    };

    console.log(`[CoursesPage] Dados do tenant '${subdomain}' carregados:`, { id: tenantData.id, name: tenantData.name });

    // Busca os cursos associados a este tenant usando o ID REAL do documento do tenant
    // ✅ Adicionado orderBy para ordenar por data de criação, mais recente primeiro
    const coursesQuery = query(
      collection(db, 'courses'),
      where('tenantId', '==', tenantData.id),
      orderBy('createdAt', 'desc') // Ordena por data de criação, decrescente
    );
    const coursesSnapshot = await getDocs(coursesQuery);

    const courses: CourseData[] = coursesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Omit<CourseData, 'id'>)
    }));

    console.log(`[CoursesPage] Encontrados ${courses.length} cursos para o tenant '${subdomain}' (ID: ${tenantData.id}).`);

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
                  📚 Cursos - {tenantData.name}
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
                Gerenciar Cursos
              </h2>
              <Link
                href={`/tenant/${subdomain}/courses/create`} // ✅ Caminho ajustado
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
                + Criar Novo Curso
              </Link>
            </div>

            {courses.length === 0 ? (
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
                  Nenhum curso criado ainda
                </h3>
                <p style={{
                  color: '#64748b',
                  margin: '0 0 24px 0'
                }}>
                  Comece criando seu primeiro curso.
                </p>
                <Link
                  href={`/tenant/${subdomain}/courses/create`} // ✅ Caminho ajustado
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
                  Criar Primeiro Curso
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
                  {courses.map((course) => (
                    <li key={course.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <div style={{ padding: '20px 24px' }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '12px'
                        }}>
                          <div style={{
                            fontSize: '16px',
                            fontWeight: '600',
                            color: '#2563eb',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            {course.title}
                          </div>
                          <div style={{
                            background: course.status === 'published' ? '#dcfce7' : '#fef3c7',
                            color: course.status === 'published' ? '#166534' : '#92400e',
                            fontSize: '12px',
                            fontWeight: '600',
                            padding: '4px 8px',
                            borderRadius: '12px'
                          }}>
                            {course.status === 'published' ? 'Publicado' : 'Rascunho'}
                          </div>
                        </div>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontSize: '14px',
                          color: '#6b7280',
                          marginBottom: '16px'
                        }}>
                          <div>
                            Preço: R$ {typeof course.price === 'number' ? course.price.toFixed(2) : 'Gratuito'}
                          </div>
                          <div>
                            Criado em: {course.createdAt?.toDate?.().toLocaleDateString('pt-BR') || 'Data não disponível'}
                          </div>
                        </div>
                        {/* Linha modificada: Adicionado o link "Gerenciar Conteúdo" com caminho ajustado */}
                        <div style={{ display: 'flex', gap: '16px' }}>
                          <Link
                            href={`/tenant/${subdomain}/courses/${course.id}/modules`} // ✅ Caminho ajustado
                            style={{
                              color: '#0ea5e9',
                              fontWeight: '500',
                              textDecoration: 'none'
                            }}
                          >
                            Gerenciar Conteúdo
                          </Link>
                          <Link
                            href={`/tenant/${subdomain}/courses/edit/${course.id}`} // ✅ Caminho ajustado
                            style={{
                              color: '#4f46e5',
                              fontWeight: '500',
                              textDecoration: 'none'
                            }}
                          >
                            Editar
                          </Link>
                          {/* ✅ CORREÇÃO 2: Adicionando o Formulário e Botão de Excluir - Corrigido */}
                          <form 
                            action={async (formData: FormData) => {
                              // Extrai os dados do FormData
                              const courseId = formData.get('courseId') as string;
                              const subdomainParam = formData.get('subdomain') as string;
                              
                              // Chama a Server Action com os dados extraídos
                              // 'use server' actions podem ser chamadas diretamente com os argumentos
                              const result = await deleteCourseAction(courseId, subdomainParam);
                              
                              // Opcional: Mostrar feedback para o usuário com base no resultado
                              if (!result.success) {
                                // Você pode usar um state para mostrar uma mensagem de erro
                                // ou usar uma biblioteca de notificações como react-toastify
                                console.error('[CoursesPage] Erro na exclusão:', result.error);
                                alert(`Erro ao excluir: ${result.error}`); // Exemplo simples
                              } else {
                                // A página será revalidada automaticamente pela revalidatePath na action
                                console.log('[CoursesPage] Curso excluído com sucesso.');
                                // Opcional: Mostrar mensagem de sucesso
                              }
                            }}
                            style={{ display: 'inline' }}
                          >
                            {/* Inputs ocultos para passar os dados */}
                            <input type="hidden" name="courseId" value={course.id} />
                            <input type="hidden" name="subdomain" value={subdomain} />
                            
                            <button
                              type="submit"
                              // onClick={(e) => {
                              //   // Opcional: Adicionar confirmação com window.confirm
                              //   if (!confirm('Tem certeza que deseja excluir este curso? Esta ação não pode ser desfeita.')) {
                              //     e.preventDefault();
                              //   }
                              // }}
                              style={{
                                color: '#ef4444', // Vermelho para indicar ação destrutiva
                                fontWeight: '500',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: 0,
                                fontSize: '14px'
                              }}
                            >
                              Excluir
                            </button>
                          </form>
                          {/* ✅ FIM da Adição do Botão de Excluir - Corrigido */}
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
    console.error(`[CoursesPage] Erro ao buscar dados do tenant '${subdomain}' ou cursos:`, error);
    // Em caso de erro interno, retorna 404 ou uma página de erro genérica
    return notFound(); // ou return <div style={{ padding: '20px' }}>Erro interno do servidor</div>;
  }
}