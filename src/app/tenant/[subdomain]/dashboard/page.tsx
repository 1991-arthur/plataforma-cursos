// src/app/tenant/[subdomain]/dashboard/page.tsx
import { notFound } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import CreateCourseForm from '@/components/tenant/CreateCourseForm'; // Importa o componente Client

export default async function DashboardPage({ params }: { params: Promise<{ subdomain: string }> }) {
  const { subdomain } = await params;

  console.log(`DashboardPage: Acessando o dashboard para o tenant: ${subdomain}`);

  // Verifica se o subdomínio é válido
  if (['admin', 'auth'].includes(subdomain)) {
    console.log(`DashboardPage: Subdomínio '${subdomain}' é reservado.`);
    return notFound();
  }

  // Busca o documento do tenant no Firestore com base no subdomínio
  try {
    const tenantRef = doc(db, 'tenants', subdomain);
    const tenantSnapshot = await getDoc(tenantRef);

    if (!tenantSnapshot.exists()) {
      console.log(`DashboardPage: Tenant '${subdomain}' não encontrado no Firestore.`);
      return notFound();
    }

    const tenantData = tenantSnapshot.data();
    const ownerId = tenantData.ownerId; // Assume que ownerId está presente

    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Painel de Controle - {tenantData.name}
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Aqui você pode gerenciar seu curso "{tenantData.name}".
            </p>

            {/* Formulário para Criar Novo Curso - Componente Client */}
            <CreateCourseForm ownerId={ownerId} />

            {/* Gerenciar Materiais */}
            <div className="mb-12 p-6 bg-white rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-2">Gerenciar Materiais</h2>
              <p className="text-gray-600 mb-4">Adicione vídeos, PDFs e outros conteúdos.</p>
              <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                Upload de Materiais
              </button>
            </div>

            {/* Alunos Matriculados */}
            <div className="p-6 bg-white rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-2">Alunos Matriculados</h2>
              <p className="text-gray-600 mb-4">Veja quem está estudando seu curso.</p>
              <button className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded">
                Ver Alunos
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error(`DashboardPage: Erro ao buscar dados do tenant '${subdomain}':`, error);
    return notFound();
  }
}
