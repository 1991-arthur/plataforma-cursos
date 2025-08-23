// src/app/tenant/[subdomain]/layout.tsx
import { notFound } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export default async function TenantLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ subdomain: string }>;
}) {
  // No Next 15+, params é Promise → precisa de await
  const { subdomain } = await params;

  // Bloquear palavras reservadas
  if (['admin', 'auth', 'api', '_next'].includes(subdomain)) {
    return notFound();
  }

  try {
    // Busca pelo campo `subdomain` em vez de usar ID
    const q = query(
      collection(db, 'tenants'),
      where('subdomain', '==', subdomain)
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return notFound();
    }

    const tenantDoc = snapshot.docs[0];
    const tenantData = tenantDoc.data();

    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">
              {tenantData.name}
            </h2>
            {/* 🔗 Aqui você pode colocar navegação global do tenant */}
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
