// src/app/tenant/[subdomain]/page.tsx
import { notFound } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Link from 'next/link';

// Função para buscar dados do tenant no Firestore
async function getTenantData(subdomain: string) {
  try {
    // Referência ao documento do tenant usando o subdomínio como ID
    const tenantRef = doc(db, 'tenants', subdomain);
    const tenantSnapshot = await getDoc(tenantRef);

    // Verifica se o tenant existe
    if (!tenantSnapshot.exists()) {
      console.log(`Tenant com subdomínio '${subdomain}' não encontrado.`);
      return null;
    }

    // Retorna os dados do tenant
    return { id: tenantSnapshot.id, ...tenantSnapshot.data() };
  } catch (error) {
    console.error('Erro ao buscar dados do tenant:', error);
    return null;
  }
}

export default async function TenantHomePage({ params }: { params: Promise<{ subdomain: string }> }) {
  // No Next.js 15, params é uma Promise e deve ser awaited em Server Components
  const { subdomain } = await params;

  console.log(`TenantHomePage: Carregando página para o subdomínio/tenant: ${subdomain}`);

  // Busca os dados do tenant no Firestore
  const tenantData = await getTenantData(subdomain);

  // Se o tenant não for encontrado, mostra a página 404
  if (!tenantData) {
    console.log(`TenantHomePage: Tenant '${subdomain}' não encontrado, retornando 404.`);
    return notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Cabeçalho do Tenant */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">
            {tenantData.name} {/* Mostra o nome do tenant */}
          </h1>
          <nav>
            <ul className="flex space-x-4">
              {/* Links de navegação do tenant podem ser adicionados aqui */}
              {/* Exemplo: <li><Link href={`/tenant/${subdomain}/cursos`} className="text-blue-600 hover:text-blue-800">Cursos</Link></li> */}
            </ul>
          </nav>
        </div>
      </header>

      {/* Conteúdo Principal do Tenant */}
      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl w-full space-y-8 text-center">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Bem-vindo ao {tenantData.name}!
            </h2>
            <p className="text-gray-600 mb-6">
              Este é o portal do seu curso. Aqui você poderá gerenciar todo o conteúdo e os alunos.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              {/* Card para gerenciar cursos */}
              <Link href={`/tenant/${subdomain}/dashboard/courses`} className="block">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 hover:bg-blue-100 transition-colors">
                  <h3 className="text-lg font-semibold text-blue-700">📚 Gerenciar Cursos</h3>
                  <p className="text-sm text-blue-600 mt-1">Crie e edite os cursos oferecidos neste portal.</p>
                </div>
              </Link>

              {/* Card para gerenciar alunos (futuro) */}
              <Link href="#" className="block opacity-50 cursor-not-allowed"> {/* Desabilitado por enquanto */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-green-700">👥 Gerenciar Alunos</h3>
                  <p className="text-sm text-green-600 mt-1">Veja a lista de alunos matriculados (em breve).</p>
                </div>
              </Link>

              {/* Card para configurações (futuro) */}
              <Link href="#" className="block opacity-50 cursor-not-allowed"> {/* Desabilitado por enquanto */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-purple-700">⚙️ Configurações</h3>
                  <p className="text-sm text-purple-600 mt-1">Personalize a aparência e funcionalidades (em breve).</p>
                </div>
              </Link>

              {/* Card para acessar como aluno (simulação) */}
              <Link href={`/tenant/${subdomain}/aluno`} className="block">
                 <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 hover:bg-yellow-100 transition-colors">
                  <h3 className="text-lg font-semibold text-yellow-700">🎓 Área do Aluno</h3>
                  <p className="text-sm text-yellow-600 mt-1">Veja como os alunos acessarão o conteúdo.</p>
                </div>
              </Link>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Subdomínio: <span className="font-mono">{subdomain}</span>
              </p>
              <p className="text-sm text-gray-500">
                ID do Tenant: <span className="font-mono">{tenantData.id}</span>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Rodapé do Tenant */}
      <footer className="bg-white py-4 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} {tenantData.name}. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}