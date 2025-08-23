// src/app/preview/page.tsx
import { notFound, redirect } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default async function PreviewPage({ searchParams }: { searchParams: Promise<{ tenant?: string }> }) {
  // AQUI É O IMPORTANTE: Aguarde o valor de searchParams antes de usá-lo
  const { tenant } = await searchParams;

  // Verifica se o parâmetro 'tenant' foi fornecido
  if (!tenant) {
    console.log("PreviewPage: Parâmetro 'tenant' não encontrado na query string.");
    return notFound();
  }

  console.log(`PreviewPage: Parâmetro 'tenant' detectado: ${tenant}`);

  // Busca o documento do tenant no Firestore com base no parâmetro
  try {
    // Assumindo que o ID do documento no Firestore é igual ao valor do parâmetro 'tenant'
    const tenantRef = doc(db, 'tenants', tenant);
    const tenantSnapshot = await getDoc(tenantRef);

    if (!tenantSnapshot.exists()) {
      console.log(`PreviewPage: Tenant '${tenant}' não encontrado no Firestore.`);
      return notFound();
    }

    const tenantData = tenantSnapshot.data();
    console.log(`PreviewPage: Dados do tenant '${tenant}' carregados:`, tenantData);

    // Se o tenant existe, redireciona para a página do tenant usando o roteamento dinâmico
    // Isso simula o que o middleware faria
    return redirect(`/tenant/${tenant}`);

  } catch (error) {
    console.error('PreviewPage: Erro ao buscar tenant:', error);
    return notFound();
  }
}