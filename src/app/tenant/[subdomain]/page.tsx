// src/app/tenant/[subdomain]/page.tsx
import { notFound } from 'next/navigation';
import { db } from '@/lib/firebase';
// Importe Timestamp se ainda não estiver importado
import { doc, getDoc, Timestamp } from 'firebase/firestore'; 
// Importe a interface Tenant
import { Tenant } from '@/types'; 

// Função para buscar dados do tenant no Firestore
// Especifica que retorna uma Promise de Tenant ou null
async function getTenantData(subdomain: string): Promise<Tenant | null> {
  try {
    console.log(`[getTenantData] Buscando dados para o tenant: ${subdomain}`);
    
    // Referência ao documento do tenant usando o subdomínio como ID
    const tenantRef = doc(db, 'tenants', subdomain);
    const tenantSnapshot = await getDoc(tenantRef);

    // Verifica se o tenant existe
    if (!tenantSnapshot.exists()) {
      console.log(`[getTenantData] Tenant com subdomínio '${subdomain}' não encontrado.`);
      return null;
    }

    // Obtém os dados crus do Firestore
    const data = tenantSnapshot.data();
    
    // Monta o objeto Tenant com tipagem explícita, mapeando os campos do Firestore para a interface
    // É crucial tratar tipos como Timestamp e fornecer valores padrão para campos que podem ser undefined
    const tenantData: Tenant = {
      // ID do documento no Firestore
      id: tenantSnapshot.id, 
      
      // Nome do tenant. Usa um valor padrão se não existir no Firestore.
      name: data.name || 'Tenant sem nome', 
      
      // Subdomínio. Usa o parâmetro da URL se não estiver no documento (embora deva estar).
      subdomain: data.subdomain || subdomain, 
      
      // ID do proprietário. Usa um valor padrão se não existir.
      ownerId: data.ownerId || '', 
      
      // Data de criação. Converte Timestamp do Firestore para Date conforme a interface Tenant.
      // Se createdAt não for um Timestamp válido, usa a data atual como fallback.
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(), 
      
      // Configurações do tenant. Inicializa com valores padrão se não existirem no Firestore.
      settings: {
        logo: data.settings?.logo || '', // Logo, se houver
        primaryColor: data.settings?.primaryColor || '', // Cor primária, se houver
        description: data.settings?.description || '', // Descrição, se houver
        // Adicione outros campos de settings conforme definidos na interface, se necessário
      },
      // Se houver outros campos na interface Tenant que não estão no exemplo acima,
      // certifique-se de incluí-los aqui também, fornecendo valores padrão se necessário.
    };

    console.log(`[getTenantData] Dados do tenant '${subdomain}' carregados:`, tenantData);
    return tenantData;
  } catch (error) {
    console.error('[getTenantData] Erro ao buscar dados do tenant:', error);
    // Em caso de erro, retorna null para indicar falha
    return null; 
  }
}

// Componente da página - Server Component no Next.js App Router
export default async function TenantHomePage({ params }: { params: Promise<{ subdomain: string }> }) {
  // No Next.js 15, params é uma Promise e deve ser awaited em Server Components
  // Esta é a maneira correta de acessar parâmetros dinâmicos conforme a documentação oficial
  const { subdomain } = await params; 

  console.log(`[TenantHomePage] Carregando página para o subdomínio/tenant: ${subdomain}`);

  // Busca os dados do tenant no Firestore
  // O tipo do resultado é agora explicitamente Tenant | null graças à tipagem da função
  const tenantData: Tenant | null = await getTenantData(subdomain);

  // Se o tenant não for encontrado, mostra a página 404
  if (!tenantData) {
    console.log(`[TenantHomePage] Tenant '${subdomain}' não encontrado, retornando 404.`);
    return notFound();
  }

  // Agora, tenantData.name e outras propriedades são reconhecidas pelo TypeScript como string
  // porque tenantData tem o tipo Tenant (que inclui essas propriedades)
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Cabeçalho do Tenant */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          {/* Agora tenantData.name é seguro de usar */}
          <h1 className="text-xl font-bold text-gray-900">
            {tenantData.name} {/* ✅ TypeScript não reclama mais */}
          </h1>
          <nav>
            <ul className="flex space-x-4">
              {/* Links de navegação do tenant podem ser adicionados aqui */}
            </ul>
          </nav>
        </div>
      </header>

      {/* Conteúdo Principal do Tenant */}
      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl w-full space-y-8 text-center">
          <div className="bg-white shadow rounded-lg p-6">
            {/* Usando tenantData.name novamente */}
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Bem-vindo ao {tenantData.name}! {/* ✅ */}
            </h2>
            <p className="text-gray-600 mb-6">
              Este é o portal do seu curso. Aqui você poderá gerenciar todo o conteúdo e os alunos.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              {/* Card para gerenciar cursos */}
              <a href={`/tenant/${subdomain}/dashboard/courses`} className="block">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 hover:bg-blue-100 transition-colors">
                  <h3 className="text-lg font-semibold text-blue-700">📚 Gerenciar Cursos</h3>
                  <p className="text-sm text-blue-600 mt-1">Crie e edite os cursos oferecidos neste portal.</p>
                </div>
              </a>

              {/* Card para gerenciar alunos (futuro) */}
              <a href="#" className="block opacity-50 cursor-not-allowed">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-green-700">👥 Gerenciar Alunos</h3>
                  <p className="text-sm text-green-600 mt-1">Veja a lista de alunos matriculados (em breve).</p>
                </div>
              </a>

              {/* Card para configurações (futuro) */}
              <a href="#" className="block opacity-50 cursor-not-allowed">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-purple-700">⚙️ Configurações</h3>
                  <p className="text-sm text-purple-600 mt-1">Personalize a aparência e funcionalidades (em breve).</p>
                </div>
              </a>

              {/* Card para acessar como aluno (simulação) */}
              <a href={`/tenant/${subdomain}/aluno`} className="block">
                 <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 hover:bg-yellow-100 transition-colors">
                  <h3 className="text-lg font-semibold text-yellow-700">🎓 Área do Aluno</h3>
                  <p className="text-sm text-yellow-600 mt-1">Veja como os alunos acessarão o conteúdo.</p>
                </div>
              </a>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Subdomínio: <span className="font-mono">{tenantData.subdomain}</span> {/* ✅ */}
              </p>
              <p className="text-sm text-gray-500">
                ID do Tenant: <span className="font-mono">{tenantData.id}</span> {/* ✅ */}
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Rodapé do Tenant */}
      <footer className="bg-white py-4 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} {tenantData.name}. Todos os direitos reservados.</p> {/* ✅ */}
        </div>
      </footer>
    </div>
  );
}
