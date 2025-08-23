// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Função para obter o nome do host
const getHostname = (request: NextRequest): string => {
  // Log detalhado de todos os headers
  console.log('[DEBUG] === Headers da Requisição ===');
  request.headers.forEach((value, key) => {
    console.log(`[DEBUG] Header: ${key} = ${value}`);
  });
  console.log('[DEBUG] =========================');

  // Vercel automaticamente define o header 'x-forwarded-host' para a URL original
  // Isso é mais confiável em ambientes de produção
  const xForwardedHost = request.headers.get('x-forwarded-host');
  const host = request.headers.get('host');
  
  console.log(`[DEBUG] getHostname - x-forwarded-host: ${xForwardedHost}, host: ${host}`);

  const resolvedHost = xForwardedHost ?? host;
  if (!resolvedHost) {
    console.log('[DEBUG] getHostname - Nenhum host encontrado, usando fallback "localhost"');
    return 'localhost'; // fallback, útil para desenvolvimento
  }
  
  // Remove a porta se estiver presente (ex: localhost:3000)
  const finalHost = resolvedHost.replace(/:\d+$/, '');
  console.log(`[DEBUG] getHostname - Host final resolvido: ${finalHost}`);
  return finalHost;
};

export function middleware(request: NextRequest) {
  console.log('\n===== MIDDLEWARE ACIONADO =====');
  console.log(`[DEBUG] middleware - URL completa da requisição: ${request.url}`);
  console.log(`[DEBUG] middleware - Pathname: ${request.nextUrl.pathname}`);
  console.log(`[DEBUG] middleware - Search Params: ${request.nextUrl.search}`);

  const hostname = getHostname(request);
  console.log(`[DEBUG] middleware - hostname detectado: ${hostname}`);
  
  const urlParts = hostname.split('.');
  console.log(`[DEBUG] middleware - hostname partes: [${urlParts.join(', ')}]`);

  // --- Nova lógica para desenvolvimento com query param ---
  // Verifica se é localhost e se há um parâmetro 'tenant' na query string
  // Isso é útil para testes sem configurar o hosts
  if (hostname === 'localhost') {
    const tenantFromQuery = request.nextUrl.searchParams.get('tenant');
    console.log(`[DEBUG] middleware - tenantFromQuery: ${tenantFromQuery}`);
    if (tenantFromQuery) {
      console.log(`✅ [Middleware] Acesso via query param 'tenant': ${tenantFromQuery}`);
      console.log(`   Pathname original: ${request.nextUrl.pathname}`);

      // Constrói a nova URL para reescrita
      const pathname = request.nextUrl.pathname;
      const newPathname = `/tenant/${tenantFromQuery}${pathname}`;
      const url = new URL(newPathname, request.url);

      console.log(`   Reescrevendo internamente para: ${url.pathname}`);
      console.log('===== FIM MIDDLEWARE =====\n');

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
    console.log('===== FIM MIDDLEWARE =====\n');

    return NextResponse.rewrite(url);
  }
  // --- Fim da lógica para produção ---

  // Se não for um subdomínio especial ou acesso via query param, continua normalmente
  // Isso permite que rotas como /admin, /auth funcionem no domínio principal
  console.log(`➡️  [Middleware] Acesso direto ao domínio principal: ${hostname}${request.nextUrl.pathname}`);
  console.log('===== FIM MIDDLEWARE =====\n');
  return NextResponse.next();
}

// Configura o matcher para aplicar o middleware em todas as rotas, exceto as estáticas
export const config = {
  matcher: [
    '/(.*)', // Match ALL paths to ensure it's called
  ],
};
