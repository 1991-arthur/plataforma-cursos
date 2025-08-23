// src/app/tenant/[subdomain]/dashboard/page.tsx
import { notFound } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore'; // ✅ Importações atualizadas
import CreateCourseForm from '@/components/tenant/CreateCourseForm';

// Interface para tipar os dados do tenant
interface TenantData {
  id: string;
  name: string;
  subdomain: string;
  ownerId: string;
  createdAt: Timestamp;
  // Adicione outras propriedades se necessário, como settings
  settings?: {
    logo?: string;
    primaryColor?: string;
    description?: string;
  };
}

export default async function DashboardPage({ params }: { params: Promise<{ subdomain: string }> }) {
  // ✅ Agora params é aguardado corretamente para Next.js 15 Server Components
  const { subdomain } = await params;

  console.log(`[DashboardPage] Acessando o dashboard para o tenant: ${subdomain}`);

  // Verifica se o subdomínio é um nome reservado
  if (['admin', 'auth', 'www', 'api', '_next'].includes(subdomain)) {
    console.log(`[DashboardPage] Subdomínio '${subdomain}' é reservado.`);
    return notFound();
  }

  try {
    // ✅ CONSULTA CORRIGIDA: Buscar pelo campo 'subdomain' em vez do ID do documento
    const tenantsCollection = collection(db, 'tenants');
    const q = query(tenantsCollection, where('subdomain', '==', subdomain));
    const querySnapshot = await getDocs(q);

    // Se nenhum documento for encontrado, retorna 404
    if (querySnapshot.empty) {
      console.log(`[DashboardPage] Tenant com subdomain '${subdomain}' não encontrado no Firestore.`);
      return notFound();
    }

    // Assumindo subdomínios únicos, pega o primeiro (e único) resultado
    const tenantDoc = querySnapshot.docs[0];
    
    // Mapeia os dados do documento para o tipo TenantData
    const tenantData: TenantData = {
      id: tenantDoc.id, // ID real do documento no Firestore
      ...(tenantDoc.data() as Omit<TenantData, 'id'>) // Espalha os dados do documento
    };

    // Extrai o ownerId para passar ao formulário
    const ownerId = tenantData.ownerId;

    // Renderiza o dashboard com os dados do tenant
    return (
      <div className="min-h-screen bg-gray-50 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Cabeçalho */}
          <div className="text-center mb-10 sm:mb-12">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Painel de Controle - {tenantData.name}
            </h1>
            <p className="text-base sm:text-lg text-gray-600">
              Gerencie seu curso <span className="font-semibold">"{tenantData.name}"</span>.
            </p>
             {/* Exibindo o ID do documento Firestore para depuração, pode ser removido */}
             {/* <p className="text-xs text-gray-500 mt-2">ID do Tenant (Firestore): {tenantData.id}</p> */}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* Criar Curso */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Criar Novo Curso</h2>
              <p className="text-gray-600 mb-4">Comece criando o conteúdo do seu curso.</p>
              {/* Passa o ownerId correto para o formulário */}
              <CreateCourseForm ownerId={ownerId} tenantId={tenantData.id} />
            </div>

            {/* Gerenciar Materiais */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Gerenciar Materiais</h2>
              <p className="text-gray-600 mb-4">Adicione vídeos, PDFs e outros conteúdos interativos.</p>
              <button
                disabled
                className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md shadow-sm text-white bg-gray-400 cursor-not-allowed"
              >
                Upload de Materiais (em breve)
              </button>
            </div>

            {/* Alunos Matriculados */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Alunos Matriculados</h2>
              <p className="text-gray-600 mb-4">Veja quem está estudando seu curso e acompanhe o progresso.</p>
              <button
                disabled
                className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md shadow-sm text-white bg-gray-400 cursor-not-allowed"
              >
                Ver Alunos (em breve)
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    // Em caso de erro interno (ex: problemas de conexão), também retorna 404 ou uma página de erro genérica
    console.error(`[DashboardPage] Erro ao buscar dados do tenant '${subdomain}':`, error);
    return notFound(); // ou return <div>Erro interno do servidor</div>;
  }
}