// src/app/tenant/[subdomain]/page.tsx
import { notFound } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default async function TenantPage({ params }: { params: Promise<{ subdomain: string }> }) {
  const { subdomain } = await params;

  console.log(`TenantPage: Carregando página para o subdomínio/tenant: ${subdomain}`);

  // Verifica se o subdomínio é válido
  if (['admin', 'auth'].includes(subdomain)) {
    console.log(`TenantPage: Subdomínio '${subdomain}' é reservado.`);
    return notFound();
  }

  // Busca o documento do tenant no Firestore com base no subdomínio
  try {
    const tenantRef = doc(db, 'tenants', subdomain);
    const tenantSnapshot = await getDoc(tenantRef);

    if (!tenantSnapshot.exists()) {
      console.log(`TenantPage: Tenant '${subdomain}' não encontrado no Firestore.`);
      return notFound();
    }

    const tenantData = tenantSnapshot.data();
    console.log(`TenantPage: Dados do tenant '${subdomain}' carregados:`, tenantData);

    // Renderiza o conteúdo do tenant
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
              Bem-vindo ao {tenantData.name}
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Este é o portal exclusivo para o curso <strong>{tenantData.name}</strong>.
            </p>
            <div className="mt-10 flex justify-center space-x-4">
              <a
                href={`/tenant/${subdomain}/login`}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out transform hover:scale-105"
              >
                Entrar
              </a>
              <a
                href={`/tenant/${subdomain}/register`}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out transform hover:scale-105"
              >
                Cadastrar-se
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error(`TenantPage: Erro ao buscar dados do tenant '${subdomain}':`, error);
    return notFound();
  }
}