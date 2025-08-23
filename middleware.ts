// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

console.log("_MIDDLEWARE_TS_CARREGADO_");

// Função para obter o nome do host
const getHostname = (request: NextRequest): string => {
  // Vercel automaticamente define o header 'x-forwarded-host' para a URL original
  // Isso é mais confiável em ambientes de produção
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host');
  if (!host) {
    return 'localhost'; // fallback, útil para desenvolvimento
  }
  return host.replace(/:\d+$/, ''); // Remove a porta se estiver presente (ex: localhost:3000)
};

export function middleware(request: NextRequest) {
  const hostname = getHostname(request);
  const urlParts = hostname.split('.');

  // --- Nova lógica para desenvolvimento com query param ---
  // Verifica se é localhost e se há um parâmetro 'tenant' na query string
  // Isso é útil para testes sem configurar o hosts
  if (hostname === 'localhost') {
    const tenantFromQuery = request.nextUrl.searchParams.get('tenant');
    if (tenantFromQuery) {
      console.log(`✅ [Middleware] Acesso via query param 'tenant': ${tenantFromQuery}`);
      console.log(`   Pathname original: ${request.nextUrl.pathname}`);

      // Constrói a nova URL para reescrita
      const pathname = request.nextUrl.pathname;
      const newPathname = `/tenant/${tenantFromQuery}${pathname}`;
      const url = new URL(newPathname, request.url);

      console.log(`   Reescrevendo internamente para: ${url.pathname}`);
      console.log('---');

      return NextResponse.rewrite(url);
    }
  }
  // --- Fim da nova lógica ---

  // --- Lógica para produção (subdomínios reais) ---
  // Verifica se é um subdomínio real (para produção)
  // (deve ter pelo menos 3 partes: subdominio.dominio.tld) e não ser 'www'
  if (urlParts.length >= 3 && urlParts[0] !== 'www') {
    const subdomain = urlParts[0];
    console.log(`🌐 [Middleware] Acesso via subdomínio real detectado: ${subdomain}`);
    console.log(`   Pathname original: ${request.nextUrl.pathname}`);

    // Constrói a nova URL para reescrita
    const pathname = request.nextUrl.pathname;
    const newPathname = `/tenant/${subdomain}${pathname}`;
    const url = new URL(newPathname, request.url);

    console.log(`   Reescrevendo internamente para: ${url.pathname}`);
    console.log('---');

    return NextResponse.rewrite(url);
  }
  // --- Fim da lógica para produção ---

  // Se não for um subdomínio especial ou acesso via query param, continua normalmente
  // Isso permite que rotas como /admin, /auth funcionem no domínio principal
  console.log(`➡️  [Middleware] Acesso direto ao domínio principal: ${hostname}${request.nextUrl.pathname}`);
  return NextResponse.next();
}

// Configura o matcher para aplicar o middleware em todas as requisições
// Isso garante que ele seja chamado para a raiz '/' e outras rotas
export const config = {
  matcher: [
    '/(.*)', // Match ALL paths
  ],
};