// src/app/tenant/[subdomain]/layout.tsx
import { notFound } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

// ATUALIZAÇÃO: O tipo de params deve indicar que é uma Promise
export default async function TenantLayout({ children, params }: { children: React.ReactNode; params: Promise<{ subdomain: string }> }) {
  // ATUALIZAÇÃO: Aguarde params antes de usá-lo
  const { subdomain } = await params;

  // Verifica se o subdomínio é válido
  if (['admin', 'auth', 'api', '_next'].includes(subdomain)) {
    return notFound();
  }

  // Busca o documento do tenant no Firestore com base no subdomínio
  try {
    const tenantRef = doc(db, 'tenants', subdomain);
    const tenantSnapshot = await getDoc(tenantRef);

    if (!tenantSnapshot.exists()) {
      return notFound();
    }

    const tenantData = tenantSnapshot.data();

    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">{tenantData.name}</h2>
            {/* Adicione links de navegação aqui, como "Home", "Cursos", etc. */}
          </div>
        </header>
        <main>{children}</main>
      </div>
    );
  } catch (error) {
    console.error('Erro ao buscar tenant no layout:', error);
    return notFound();
  }
}