// src/app/tenant/[subdomain]/dashboard/page.tsx
import { notFound } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import CreateCourseForm from '@/components/tenant/CreateCourseForm';

interface TenantData {
  id: string;
  name: string;
  subdomain: string;
  ownerId: string;
  createdAt: Timestamp;
}

export default async function DashboardPage({ params }: { params: Promise<{ subdomain: string }> }) {
  const { subdomain } = await params; // ✅ Agora params é aguardado

  console.log(`[DashboardPage] Acessando o dashboard para o tenant: ${subdomain}`);

  if (['admin', 'auth', 'www', 'api', '_next'].includes(subdomain)) {
    console.log(`[DashboardPage] Subdomínio '${subdomain}' é reservado.`);
    return notFound();
  }

  try {
    const tenantRef = doc(db, 'tenants', subdomain);
    const tenantSnapshot = await getDoc(tenantRef);

    if (!tenantSnapshot.exists()) {
      console.log(`[DashboardPage] Tenant '${subdomain}' não encontrado no Firestore.`);
      return notFound();
    }

    const tenantData: TenantData = {
      id: tenantSnapshot.id,
      ...tenantSnapshot.data(),
    } as TenantData;

    const ownerId = tenantData.ownerId;

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
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* Criar Curso */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Criar Novo Curso</h2>
              <p className="text-gray-600 mb-4">Comece criando o conteúdo do seu curso.</p>
              <CreateCourseForm ownerId={ownerId} />
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
    console.error(`[DashboardPage] Erro ao buscar dados do tenant '${subdomain}':`, error);
    return notFound();
  }
}
