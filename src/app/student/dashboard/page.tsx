// src/app/student/dashboard/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getEnrolledCourses, getAvailableCourses, getRecentLessons, calculateOverallProgress } from '@/lib/dashboard';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

interface EnrolledCourse {
  id: string;
  title: string;
  description?: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  lastAccessed?: Date;
  enrolledAt: Date;
  thumbnail?: string;
}

interface AvailableCourse {
  id: string;
  title: string;
  description?: string;
  price?: number;
  status: 'published';
  thumbnail?: string;
  instructor?: string;
}

interface RecentLesson {
  id: string;
  lessonId: string;
  courseId: string;
  courseTitle: string;
  title: string;
  moduleName: string;
  accessedAt: Date;
  type: 'video' | 'text' | 'code' | 'pdf';
}

export default function StudentDashboard() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // ✅ Obter tenantId dos parâmetros da URL
  const tenantId = searchParams.get('tenant') || process.env.NEXT_PUBLIC_DEFAULT_TENANT_ID || 'default';
  
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [availableCourses, setAvailableCourses] = useState<AvailableCourse[]>([]);
  const [recentLessons, setRecentLessons] = useState<RecentLesson[]>([]);
  const [overallProgress, setOverallProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showIndexWarning, setShowIndexWarning] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  useEffect(() => {
    console.log('[Dashboard] Iniciando carregamento do dashboard para tenant:', tenantId);
    
    if (!isAuthenticated && !isLoading) {
      console.log('[Dashboard] Usuário não autenticado, redirecionando para login');
      router.push(`/login?tenant=${tenantId}`);
      return;
    }
    
    if (user && isAuthenticated) {
      console.log('[Dashboard] Usuário autenticado, carregando dados do tenant:', tenantId);
      loadDashboardData();
    }
  }, [user, isAuthenticated, isLoading, router, tenantId]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      setShowIndexWarning(false);
      
      console.log('[Dashboard] Carregando dados do dashboard para usuário:', user?.id, 'no tenant:', tenantId);
      
      // ✅ Carregar dados FILTRADOS pelo tenantId
      const [enrolled, available, recent] = await Promise.all([
        getEnrolledCourses(user!.id, tenantId), // ✅ Passar tenantId
        getAvailableCourses(user!.id, tenantId), // ✅ Passar tenantId
        getRecentLessons(user!.id, 5)
      ]);
      
      console.log('[Dashboard] Dados carregados:', { 
        enrolled: enrolled.length, 
        available: available.length, 
        recent: recent.length 
      });
      
      setEnrolledCourses(enrolled);
      setAvailableCourses(available);
      setRecentLessons(recent);
      setOverallProgress(calculateOverallProgress(enrolled));
      
    } catch (err: any) {
      console.error('[Dashboard] Erro ao carregar dados:', err);
      
      if (err.code === 'failed-precondition') {
        setShowIndexWarning(true);
        setError('Necessário criar índice no Firestore para algumas funcionalidades.');
      } else {
        setError('Erro ao carregar dados do dashboard. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
  try {
    setLogoutLoading(true);
    await logout();
    // ✅ Redirecionar para login do tenant correto após logout
    router.push(`/login?tenant=${tenantId}`);
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
    alert('Erro ao fazer logout. Tente novamente.');
  } finally {
    setLogoutLoading(false);
  }
};


  const formatDate = (date?: Date): string => {
    if (!date) return 'Nunca';
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (isLoading || loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: '#f9fafb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '40px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #0ea5e9',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p style={{
            color: '#64748b',
            fontSize: '16px'
          }}>
            Carregando dashboard do tenant {tenantId}...
          </p>
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
        justifyContent: 'center'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '40px',
          maxWidth: '500px'
        }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '16px'
          }}>
            ❌
          </div>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '8px'
          }}>
            Oops! Algo deu errado
          </h2>
          <p style={{
            color: '#64748b',
            marginBottom: '24px'
          }}>
            {error}
          </p>
          <button
            onClick={loadDashboardData}
            style={{
              background: '#0ea5e9',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      {/* Header - ATUALIZADO com botão de logout */}
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
                🎓 Meu Dashboard - {tenantId}
              </h1>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              {/* ✅ Botão de Logout */}
              <button
                onClick={handleLogout}
                disabled={logoutLoading}
                style={{
                  background: logoutLoading ? '#94a3b8' : '#ef4444',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: logoutLoading ? 'not-allowed' : 'pointer',
                  fontWeight: '500',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'background-color 0.2s'
                }}
              >
                {logoutLoading ? (
                  <>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid #ffffff',
                      borderTop: '2px solid transparent',
                      borderRadius: '50%',
                      animation: 'spin 0.6s linear infinite'
                    }}></div>
                    Saindo...
                  </>
                ) : (
                  <>
                    <span>🚪</span>
                    Sair
                  </>
                )}
              </button>
              
              <div style={{
                textAlign: 'right'
              }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151'
                }}>
                  {user?.name}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#64748b'
                }}>
                  {user?.email}
                </div>
              </div>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#0ea5e9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: '600',
                fontSize: '14px'
              }}>
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
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
        {/* Mensagem de aviso de índice (se necessário) */}
        {showIndexWarning && (
          <div style={{
            background: '#fffbeb',
            border: '1px solid #fef3c7',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{ fontSize: '24px' }}>⚠️</div>
              <div>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#92400e',
                  margin: '0 0 4px 0'
                }}>
                  Atenção: Índice necessário no Firestore
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: '#92400e',
                  margin: 0
                }}>
                  Algumas funcionalidades podem não funcionar corretamente até que o índice seja criado.
                </p>
                <button
                  onClick={() => {
                    // Abrir link em nova aba
                    window.open('https://console.firebase.google.com/v1/r/project/plataforma-cursos-a5a39/firestore/indexes?create_composite=Cl5wcm9qZWN0cy9wbGF0YWZvcm1hLWN1cnNvcy1hNWEzOS9kYXRhYmFzZXMvKGRlZmF1bHQpL2NvbGxlY3Rpb25Hcm91cHMvcmVjZW50X2xlc3NvbnMvaW5kZXhlcy9fEAEaCgoGdXNlcklkEAEaDgoKYWNjZXNzZWRBdBACGgwKCF9fbmFtZV9fEAI', '_blank');
                  }}
                  style={{
                    marginTop: '8px',
                    background: '#f59e0b',
                    color: 'white',
                    padding: '6px 12px',
                    borderRadius: '4px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}
                >
                  Criar Índice Automaticamente
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Resumo do Progresso */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          padding: '24px',
          marginBottom: '32px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#1f2937',
              margin: 0
            }}>
              📊 Seu Progresso Geral
            </h2>
            <div style={{
              fontSize: '24px',
              fontWeight: '700',
              color: overallProgress === 100 ? '#10b981' : '#0ea5e9'
            }}>
              {overallProgress}%
            </div>
          </div>
          
          <div style={{
            height: '12px',
            background: '#e5e7eb',
            borderRadius: '6px',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              background: overallProgress === 100 ? '#10b981' : '#0ea5e9',
              width: `${overallProgress}%`,
              transition: 'width 0.3s ease'
            }}></div>
          </div>
          
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '8px',
            fontSize: '14px',
            color: '#64748b'
          }}>
            <span>{enrolledCourses.length} cursos matriculados</span>
            <span>{recentLessons.length} aulas recentes</span>
          </div>
        </div>

        {/* Cursos Matriculados */}
        <section style={{ marginBottom: '40px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px'
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#1f2937',
              margin: 0
            }}>
              📚 Meus Cursos
            </h2>
            {enrolledCourses.length > 0 && (
              <Link
                href={`/student/courses?tenant=${tenantId}`}
                style={{
                  color: '#0ea5e9',
                  fontSize: '14px',
                  textDecoration: 'none',
                  fontWeight: '500'
                }}
              >
                Ver todos →
              </Link>
            )}
          </div>

          {enrolledCourses.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '48px 24px',
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              border: '1px dashed #cbd5e1'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📚</div>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#334155',
                margin: '0 0 8px 0'
              }}>
                Você ainda não está matriculado em nenhum curso
              </h3>
              <p style={{
                color: '#64748b',
                margin: '0 0 24px 0'
              }}>
                Explore os cursos disponíveis e comece sua jornada de aprendizado.
              </p>
              <Link
                href="#cursos-disponiveis"
                style={{
                  background: '#0ea5e9',
                  color: 'white',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: '500',
                  display: 'inline-block'
                }}
              >
                Ver Cursos Disponíveis
              </Link>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '24px'
            }}>
              {enrolledCourses.map((course) => (
                <div key={course.id} style={{
                  background: 'white',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  border: '1px solid #e5e7eb',
                  overflow: 'hidden',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
                onMouseEnter={(e) => {
                  const target = e.target as HTMLElement;
                  if (target.closest('div[style*="border-radius: 12px"]')) {
                    (target.closest('div[style*="border-radius: 12px"]') as HTMLElement).style.transform = 'translateY(-4px)';
                    (target.closest('div[style*="border-radius: 12px"]') as HTMLElement).style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  const target = e.target as HTMLElement;
                  if (target.closest('div[style*="border-radius: 12px"]')) {
                    (target.closest('div[style*="border-radius: 12px"]') as HTMLElement).style.transform = 'translateY(0)';
                    (target.closest('div[style*="border-radius: 12px"]') as HTMLElement).style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                  }
                }}
                >
                  {course.thumbnail ? (
                    <div style={{
                      height: '160px',
                      overflow: 'hidden'
                    }}>
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    </div>
                  ) : (
                    <div style={{
                      height: '160px',
                      background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '48px'
                    }}>
                      📚
                    </div>
                  )}
                  
                  <div style={{ padding: '20px' }}>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#1f2937',
                      margin: '0 0 8px 0',
                      lineHeight: '1.4'
                    }}>
                      {course.title}
                    </h3>
                    {course.description && (
                      <p style={{
                        color: '#64748b',
                        fontSize: '14px',
                        margin: '0 0 16px 0',
                        lineHeight: '1.5',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {course.description}
                      </p>
                    )}
                    
                    {/* Barra de Progresso */}
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '12px',
                        color: '#64748b',
                        marginBottom: '4px'
                      }}>
                        <span>Progresso</span>
                        <span>{course.progress}%</span>
                      </div>
                      <div style={{
                        height: '8px',
                        background: '#e5e7eb',
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          height: '100%',
                          background: course.progress === 100 ? '#10b981' : '#0ea5e9',
                          width: `${course.progress}%`,
                          transition: 'width 0.3s ease'
                        }}></div>
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: '#64748b',
                        marginTop: '4px'
                      }}>
                        {course.completedLessons} de {course.totalLessons} aulas concluídas
                      </div>
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '12px',
                      color: '#9ca3af'
                    }}>
                      <span>
                        📅 Matriculado em {formatDate(course.enrolledAt)}
                      </span>
                      {course.lastAccessed && (
                        <span>
                          👁️ Último acesso {formatDate(course.lastAccessed)}
                        </span>
                      )}
                    </div>
                    
                    <Link
                      href={`/courses/${course.id}?tenant=${tenantId}`}
                      style={{
                        display: 'inline-block',
                        background: course.progress === 100 ? '#10b981' : '#0ea5e9',
                        color: 'white',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        textDecoration: 'none',
                        fontWeight: '500',
                        fontSize: '14px',
                        marginTop: '16px',
                        textAlign: 'center',
                        width: '100%',
                        boxSizing: 'border-box'
                      }}
                    >
                      {course.progress === 100 ? '✅ Curso Concluído' : 'Continuar Aprendendo'}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Cursos Disponíveis */}
        <section id="cursos-disponiveis" style={{ marginBottom: '40px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px'
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#1f2937',
              margin: 0
            }}>
              🌟 Cursos Disponíveis
            </h2>
          </div>

          {availableCourses.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '48px 24px',
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              border: '1px dashed #cbd5e1'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#334155',
                margin: '0 0 8px 0'
              }}>
                Você está matriculado em todos os cursos disponíveis!
              </h3>
              <p style={{
                color: '#64748b',
                margin: '0 0 24px 0'
              }}>
                Continue seu aprendizado ou aguarde novos cursos.
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '24px'
            }}>
              {availableCourses.map((course) => (
                <div key={course.id} style={{
                  background: 'white',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  border: '1px solid #e5e7eb',
                  overflow: 'hidden'
                }}>
                  {course.thumbnail ? (
                    <div style={{
                      height: '160px',
                      overflow: 'hidden'
                    }}>
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    </div>
                  ) : (
                    <div style={{
                      height: '160px',
                      background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '48px'
                    }}>
                      🌟
                    </div>
                  )}
                  
                  <div style={{ padding: '20px' }}>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#1f2937',
                      margin: '0 0 8px 0',
                      lineHeight: '1.4'
                    }}>
                      {course.title}
                    </h3>
                    {course.description && (
                      <p style={{
                        color: '#64748b',
                        fontSize: '14px',
                        margin: '0 0 16px 0',
                        lineHeight: '1.5',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {course.description}
                      </p>
                    )}
                    
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: '16px'
                    }}>
                      {course.price ? (
                        <div style={{
                          fontSize: '18px',
                          fontWeight: '700',
                          color: '#059669'
                        }}>
                          R$ {course.price.toFixed(2)}
                        </div>
                      ) : (
                        <div style={{
                          fontSize: '14px',
                          fontWeight: '500',
                          color: '#64748b'
                        }}>
                          Gratuito
                        </div>
                      )}
                      
                      <Link
                        href={`/courses/${course.id}?tenant=${tenantId}`}
                        style={{
                          display: 'inline-block',
                          background: '#10b981',
                          color: 'white',
                          padding: '8px 16px',
                          borderRadius: '6px',
                          textDecoration: 'none',
                          fontWeight: '500',
                          fontSize: '14px'
                        }}
                      >
                        Saiba Mais
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Aulas Recentes */}
        {recentLessons.length > 0 && (
          <section>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#1f2937',
                margin: 0
              }}>
                🕒 Aulas Recentes
              </h2>
            </div>

            <div style={{
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e5e7eb',
              overflow: 'hidden'
            }}>
              <ul style={{ 
                listStyle: 'none', 
                padding: 0, 
                margin: 0 
              }}>
                {recentLessons.map((lesson, index) => (
                  <li 
                    key={lesson.id} 
                    style={{ 
                      borderBottom: index < recentLessons.length - 1 ? '1px solid #f3f4f6' : 'none'
                    }}
                  >
                    <div style={{ padding: '16px 20px' }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <div style={{ flex: 1 }}>
                          <Link
                            href={`/courses/${lesson.courseId}/lessons/${lesson.lessonId}?tenant=${tenantId}`}
                            style={{
                              fontSize: '16px',
                              fontWeight: '600',
                              color: '#2563eb',
                              textDecoration: 'none',
                              display: 'block',
                              marginBottom: '4px'
                            }}
                          >
                            {lesson.title}
                          </Link>
                          <div style={{
                            fontSize: '14px',
                            color: '#64748b',
                            marginBottom: '4px'
                          }}>
                            {lesson.moduleName} • {lesson.courseTitle}
                          </div>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}>
                            <span style={{
                              background: lesson.type === 'video' ? '#ede9fe' : 
                                         lesson.type === 'text' ? '#dcfce7' : 
                                         lesson.type === 'code' ? '#fef3c7' : 
                                         '#e5e7eb',
                              color: lesson.type === 'video' ? '#5b21b6' : 
                                    lesson.type === 'text' ? '#166534' : 
                                    lesson.type === 'code' ? '#92400e' : 
                                    '#374151',
                              fontSize: '10px',
                              fontWeight: '600',
                              padding: '2px 6px',
                              borderRadius: '8px',
                              textTransform: 'uppercase'
                            }}>
                              {lesson.type}
                            </span>
                            <span style={{
                              fontSize: '12px',
                              color: '#9ca3af'
                            }}>
                              Acessado em {formatDate(lesson.accessedAt)}
                            </span>
                          </div>
                        </div>
                        <Link
                          href={`/courses/${lesson.courseId}/lessons/${lesson.lessonId}?tenant=${tenantId}`}
                          style={{
                            color: '#0ea5e9',
                            textDecoration: 'none',
                            fontWeight: '500',
                            fontSize: '14px',
                            padding: '6px 12px',
                            border: '1px solid #0ea5e9',
                            borderRadius: '4px',
                            marginLeft: '16px'
                          }}
                        >
                          Continuar
                        </Link>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}