// src/app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function HomePage() {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)' }}>
      {/* Header */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        background: isScrolled ? 'rgba(255, 255, 255, 0.95)' : 'transparent',
        backdropFilter: isScrolled ? 'blur(10px)' : 'none',
        boxShadow: isScrolled ? '0 2px 10px rgba(0, 0, 0, 0.1)' : 'none',
        padding: '1rem 2rem',
        zIndex: 50,
        transition: 'all 0.3s ease'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <h1 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              background: 'linear-gradient(90deg, #0ea5e9, #0d9488)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              margin: 0
            }}>
              🎓 Plataforma de Cursos
            </h1>
          </div>
          <nav style={{ display: 'flex', gap: '1.5rem' }}>
            <Link href="#features" style={{
              color: '#334155',
              textDecoration: 'none',
              fontWeight: 500,
              transition: 'color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.color = '#0ea5e9'}
            onMouseOut={(e) => e.target.style.color = '#334155'}
            >
              Recursos
            </Link>
            <Link href="#how-it-works" style={{
              color: '#334155',
              textDecoration: 'none',
              fontWeight: 500,
              transition: 'color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.color = '#0ea5e9'}
            onMouseOut={(e) => e.target.style.color = '#334155'}
            >
              Como Funciona
            </Link>
            <Link href="#pricing" style={{
              color: '#334155',
              textDecoration: 'none',
              fontWeight: 500,
              transition: 'color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.color = '#0ea5e9'}
            onMouseOut={(e) => e.target.style.color = '#334155'}
            >
              Preços
            </Link>
          </nav>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link href="/login" style={{
              background: 'transparent',
              color: '#0ea5e9',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              fontWeight: 500,
              border: '1px solid #0ea5e9',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.target.style.background = '#0ea5e9';
              e.target.style.color = 'white';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.color = '#0ea5e9';
            }}
            >
              Entrar
            </Link>
            <Link href="/register" style={{
              background: '#0ea5e9',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              fontWeight: 500,
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.background = '#0284c7'}
            onMouseOut={(e) => e.target.style.background = '#0ea5e9'}
            >
              Criar Conta
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{
        paddingTop: '10rem',
        paddingBottom: '6rem',
        textAlign: 'center'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 2rem'
        }}>
          <h1 style={{
            fontSize: '3rem',
            fontWeight: 800,
            lineHeight: 1.2,
            background: 'linear-gradient(90deg, #0ea5e9, #0d9488)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '1.5rem'
          }}>
            Crie e Gerencie Cursos Online com Facilidade
          </h1>
          <p style={{
            fontSize: '1.25rem',
            color: '#64748b',
            maxWidth: '36rem',
            margin: '0 auto 2.5rem'
          }}>
            Uma plataforma completa para educadores criarem, organizarem e venderem cursos online de forma profissional.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <button
              onClick={() => router.push('/register')}
              style={{
                background: '#0ea5e9',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                border: 'none',
                fontWeight: 600,
                fontSize: '1rem',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
              }}
              onMouseOver={(e) => e.target.style.background = '#0284c7'}
              onMouseOut={(e) => e.target.style.background = '#0ea5e9'}
            >
              Comece Agora - É Grátis
            </button>
            <button
              onClick={() => {
                const element = document.getElementById('how-it-works');
                if (element) element.scrollIntoView({ behavior: 'smooth' });
              }}
              style={{
                background: 'white',
                color: '#0ea5e9',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                border: '1px solid #0ea5e9',
                fontWeight: 600,
                fontSize: '1rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.target.style.background = '#f0f9ff';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'white';
              }}
            >
              Ver Demonstração
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={{
        padding: '5rem 2rem',
        background: 'white'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{
              fontSize: '2rem',
              fontWeight: 700,
              color: '#1e293b',
              marginBottom: '1rem'
            }}>
              Tudo que você precisa em uma plataforma
            </h2>
            <p style={{
              fontSize: '1.125rem',
              color: '#64748b',
              maxWidth: '36rem',
              margin: '0 auto'
            }}>
              Ferramentas poderosas para criar uma experiência de aprendizado excepcional.
            </p>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem'
          }}>
            {[
              { icon: '📚', title: 'Criação de Cursos', description: 'Crie cursos com módulos, aulas e conteúdos variados de forma intuitiva.' },
              { icon: '🎥', title: 'Vídeos e Materiais', description: 'Integre vídeos, PDFs, quizzes e outros materiais interativos.' },
              { icon: '👥', title: 'Gestão de Alunos', description: 'Acompanhe o progresso dos alunos e gerencie matrículas.' },
              { icon: '💳', title: 'Venda seus Cursos', description: 'Configure preços, cupons e integrações de pagamento.' },
              { icon: '📊', title: 'Relatórios', description: 'Obtenha insights sobre desempenho e engajamento dos alunos.' },
              { icon: '🎨', title: 'Personalização', description: 'Customize a aparência da sua escola online com sua marca.' }
            ].map((feature, index) => (
              <div key={index} style={{
                background: '#f8fafc',
                borderRadius: '0.75rem',
                padding: '2rem',
                border: '1px solid #e2e8f0',
                textAlign: 'center',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.1)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
              }}
              >
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{feature.icon}</div>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  color: '#1e293b',
                  marginBottom: '0.75rem'
                }}>
                  {feature.title}
                </h3>
                <p style={{
                  color: '#64748b',
                  lineHeight: 1.6
                }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" style={{
        padding: '5rem 2rem',
        background: '#f0f9ff'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{
              fontSize: '2rem',
              fontWeight: 700,
              color: '#1e293b',
              marginBottom: '1rem'
            }}>
              Como a Plataforma Funciona
            </h2>
            <p style={{
              fontSize: '1.125rem',
              color: '#64748b',
              maxWidth: '36rem',
              margin: '0 auto'
            }}>
              Comece a ensinar online em três passos simples.
            </p>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem'
          }}>
            {[
              { number: '1', title: 'Crie sua Conta', description: 'Registre-se gratuitamente e configure seu perfil de instrutor.' },
              { number: '2', title: 'Desenvolva seu Curso', description: 'Use nosso editor intuitivo para criar módulos e aulas envolventes.' },
              { number: '3', title: 'Publique e Venda', description: 'Defina preços, promova seu curso e comece a ensinar.' }
            ].map((step, index) => (
              <div key={index} style={{
                display: 'flex',
                gap: '1.5rem'
              }}>
                <div style={{
                  background: '#0ea5e9',
                  color: 'white',
                  width: '3rem',
                  height: '3rem',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  flexShrink: 0
                }}>
                  {step.number}
                </div>
                <div>
                  <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: 600,
                    color: '#1e293b',
                    marginBottom: '0.75rem'
                  }}>
                    {step.title}
                  </h3>
                  <p style={{
                    color: '#64748b',
                    lineHeight: 1.6
                  }}>
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '5rem 2rem',
        background: 'linear-gradient(135deg, #0ea5e9 0%, #0d9488 100%)',
        color: 'white',
        textAlign: 'center'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: 700,
            marginBottom: '1rem'
          }}>
            Pronto para começar?
          </h2>
          <p style={{
            fontSize: '1.125rem',
            maxWidth: '36rem',
            margin: '0 auto 2rem',
            opacity: 0.9
          }}>
            Junte-se a milhares de educadores que já estão ensinando online com nossa plataforma.
          </p>
          <button
            onClick={() => router.push('/register')}
            style={{
              background: 'white',
              color: '#0ea5e9',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              border: 'none',
              fontWeight: 600,
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 8px rgba(0, 0, 0, 0.15)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
            }}
          >
            Criar Minha Conta Gratuita
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        background: '#1e293b',
        color: 'white',
        padding: '3rem 2rem 2rem'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '2rem',
            marginBottom: '3rem'
          }}>
            <div>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: 600,
                marginBottom: '1rem'
              }}>
                🎓 Plataforma de Cursos
              </h3>
              <p style={{
                color: '#94a3b8',
                lineHeight: 1.6
              }}>
                A melhor plataforma para criar e vender cursos online.
              </p>
            </div>
            <div>
              <h4 style={{
                fontSize: '1rem',
                fontWeight: 600,
                marginBottom: '1rem'
              }}>
                Recursos
              </h4>
              <ul style={{
                listStyle: 'none',
                padding: 0,
                margin: 0
              }}>
                {['Criação de Cursos', 'Venda de Cursos', 'Relatórios', 'Integrações'].map((item, index) => (
                  <li key={index} style={{ marginBottom: '0.5rem' }}>
                    <a href="#" style={{
                      color: '#94a3b8',
                      textDecoration: 'none',
                      transition: 'color 0.2s'
                    }}
                    onMouseOver={(e) => e.target.style.color = 'white'}
                    onMouseOut={(e) => e.target.style.color = '#94a3b8'}
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 style={{
                fontSize: '1rem',
                fontWeight: 600,
                marginBottom: '1rem'
              }}>
                Empresa
              </h4>
              <ul style={{
                listStyle: 'none',
                padding: 0,
                margin: 0
              }}>
                {['Sobre', 'Blog', 'Carreiras', 'Contato'].map((item, index) => (
                  <li key={index} style={{ marginBottom: '0.5rem' }}>
                    <a href="#" style={{
                      color: '#94a3b8',
                      textDecoration: 'none',
                      transition: 'color 0.2s'
                    }}
                    onMouseOver={(e) => e.target.style.color = 'white'}
                    onMouseOut={(e) => e.target.style.color = '#94a3b8'}
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 style={{
                fontSize: '1rem',
                fontWeight: 600,
                marginBottom: '1rem'
              }}>
                Suporte
              </h4>
              <ul style={{
                listStyle: 'none',
                padding: 0,
                margin: 0
              }}>
                <li style={{ marginBottom: '0.5rem' }}>
                  <a href="#" style={{
                    color: '#94a3b8',
                    textDecoration: 'none',
                    transition: 'color 0.2s'
                  }}
                  onMouseOver={(e) => e.target.style.color = 'white'}
                  onMouseOut={(e) => e.target.style.color = '#94a3b8'}
                  >
                    Central de Ajuda
                  </a>
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  <a href="#" style={{
                    color: '#94a3b8',
                    textDecoration: 'none',
                    transition: 'color 0.2s'
                  }}
                  onMouseOver={(e) => e.target.style.color = 'white'}
                  onMouseOut={(e) => e.target.style.color = '#94a3b8'}
                  >
                    Termos de Serviço
                  </a>
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  <a href="#" style={{
                    color: '#94a3b8',
                    textDecoration: 'none',
                    transition: 'color 0.2s'
                  }}
                  onMouseOver={(e) => e.target.style.color = 'white'}
                  onMouseOut={(e) => e.target.style.color = '#94a3b8'}
                  >
                    Política de Privacidade
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div style={{
            borderTop: '1px solid #334155',
            paddingTop: '2rem',
            textAlign: 'center',
            color: '#94a3b8',
            fontSize: '0.875rem'
          }}>
            <p>© {new Date().getFullYear()} Plataforma de Cursos. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}