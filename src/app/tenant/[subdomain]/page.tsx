// src/app/tenant/[subdomain]/page.tsx
export default async function TenantPage({ params }: { params: { subdomain: string } }) {
  const { subdomain } = params;

  // Log para verificar se o componente está sendo chamado
  console.log("TenantPage chamada com subdomain:", subdomain);

  // Garante que o componente é Server Component
  await new Promise(resolve => setTimeout(resolve, 100));

  return (
    <div style={{ padding: '50px', textAlign: 'center', backgroundColor: '#f0f8ff' }}>
      <h1 style={{ color: '#4a90e2' }}>✅ Subdomínio Detectado: {subdomain}</h1>
      <p style={{ fontSize: '18px' }}>
        Se você está vendo isso, a rota dinâmica <code>/tenant/[subdomain]/page.tsx</code> está funcionando!
      </p>
      <p style={{ marginTop: '20px', fontSize: '16px', color: '#666' }}>
        Próximo passo: Integrar com o Firestore para buscar os dados do tenant.
      </p>
    </div>
  );
}