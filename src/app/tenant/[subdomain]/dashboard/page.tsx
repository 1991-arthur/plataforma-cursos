// src/app/tenant/[subdomain]/dashboard/page.tsx
import { notFound } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import CreateCourseForm from '@/components/tenant/CreateCourseForm';
// Se você tiver a interface Tenant definida em src/types
// import { Tenant } from '@/types';

// Se não tiver a interface Tenant, defina uma tipagem inline ou local
interface TenantData {
  id: string;
  name: string;
  subdomain: string;
  ownerId: string;
  createdAt: Timestamp; // Ou Date, dependendo de como você trata os dados
  // ... outras propriedades do tenant
}

export default async function DashboardPage({ params }: { params: Promise<{ subdomain: string }> }) {
  // Acessa o parâmetro subdomain corretamente para Next.js 15 Server Components
  const { subdomain } = await params;

  console.log(`[DashboardPage] Acessando o dashboard para o tenant: ${subdomain}`);

  // Verifica se o subdomínio é um nome reservado
  if (['admin', 'auth', 'www', 'api', '_next'].includes(subdomain)) {
    console.log(`[DashboardPage] Subdomínio '${subdomain}' é reservado.`);
    return notFound();
  }

  try {
    // Busca os dados do tenant no Firestore usando o subdomain como ID do documento
    const tenantRef = doc(db, 'tenants', subdomain);
    const tenantSnapshot = await getDoc(tenantRef);

    // Se o documento do tenant não existir, retorna 404
    if (!tenantSnapshot.exists()) {
      console.log(`[DashboardPage] Tenant '${subdomain}' não encontrado no Firestore.`);
      return notFound();
    }

    // Extrai os dados do documento do tenant
    // Se estiver usando a interface Tenant:
    // const tenantData: Tenant = { id: tenantSnapshot.id, ...(tenantSnapshot.data() as Omit<Tenant, 'id'>) };
    // Caso contrário, tipagem inline/local:
    const tenantData: TenantData = {
      id: tenantSnapshot.id,
      ...tenantSnapshot.data()
    };

    const ownerId = tenantData.ownerId;

    return (
      <div className="min-h-screen bg-gray-50 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Cabeçalho do Dashboard */}
          <div className="text-center mb-10 sm:mb-12">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Painel de Controle - {tenantData.name}
            </h1>
            <p className="text-base sm:text-lg text-gray-600">
              Gerencie seu curso <span className="font-semibold">"{tenantData.name}"</span>.
            </p>
          </div>

          {/* Grid para organizar as seções */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">

            {/* Seção: Criar Novo Curso */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Criar Novo Curso</h2>
              <p className="text-gray-600 mb-4">Comece criando o conteúdo do seu curso.</p>
              {/* Componente Client para o formulário de criação de curso */}
              <CreateCourseForm ownerId={ownerId} />
            </div>

            {/* Seção: Gerenciar Materiais */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Gerenciar Materiais</h2>
              <p className="text-gray-600 mb-4">Adicione vídeos, PDFs e outros conteúdos interativos.</p>
              {/* Placeholder para funcionalidade futura - pode ser um Link ou botão que abre um modal/formulário */}
              <button
                 onClick={() => alert('Funcionalidade de Upload de Materiais em breve!')} // Substituir por navegação real ou modal
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                // Se quiser desabilitar temporariamente:
                // disabled
              >
                {/* {disabled ? 'Em Breve' : 'Upload de Materiais'} */}
                Upload de Materiais
              </button>
              {/* <p className="mt-2 text-sm text-gray-500">Disponível em breve.</p> */}
            </div>

            {/* Seção: Alunos Matriculados (ocupando toda a largura abaixo) */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Alunos Matriculados</h2>
              <p className="text-gray-600 mb-4">Veja quem está estudando seu curso e acompanhe o progresso.</p>
              {/* Placeholder para funcionalidade futura - pode ser um Link para uma página de lista */}
              <button
                onClick={() => alert('Funcionalidade de Lista de Alunos em breve!')} // Substituir por navegação real
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                // Se quiser desabilitar temporariamente:
                // disabled
              >
                {/* {disabled ? 'Em Breve' : 'Ver Alunos'} */}
                Ver Alunos
              </button>
              {/* <p className="mt-2 text-sm text-gray-500">Disponível em breve.</p> */}
            </div>

          </div>
        </div>
      </div>
    );
  } catch (error) {
    // Trata erros durante a busca de dados
    console.error(`[DashboardPage] Erro ao buscar dados do tenant '${subdomain}':`, error);
    // Em caso de erro interno, também retorna 404 ou uma página de erro genérica
    return notFound();
  }
}