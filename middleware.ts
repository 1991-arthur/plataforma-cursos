// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Função para obter o nome do host
const getHostname = (request: NextRequest): string => {
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host');
  if (!host) {
    return 'localhost';
  }
  return host.replace(/:\d+$/, '');
};

export function middleware(request: NextRequest) {
  const hostname = getHostname(request);
  const urlParts = hostname.split('.');

  // --- Lógica para desenvolvimento com query param ---
  if (hostname === 'localhost') {
    const tenantFromQuery = request.nextUrl.searchParams.get('tenant');
    if (tenantFromQuery) {
      console.log(`✅ [Middleware] Acesso via query param 'tenant': ${tenantFromQuery}`);
      const pathname = request.nextUrl.pathname;
      const newPathname = `/tenant/${tenantFromQuery}${pathname}`;
      const url = new URL(newPathname, request.url);
      console.log(`   Reescrevendo internamente para: ${url.pathname}`);
      return NextResponse.rewrite(url);
    }
    // Se for localhost SEM o parametro tenant, deixa passar normalmente.
    // Não retorna NextResponse.next() aqui para não interromper o fluxo.
  }
  // --- Fim da lógica para query param ---

  // --- Lógica para produção (subdomínios reais) ---
  if (urlParts.length >= 3 && urlParts[0] !== 'www') {
    const subdomain = urlParts[0];
    console.log(`🌐 [Middleware] Acesso via subdomínio real detectado: ${subdomain}`);
    const pathname = request.nextUrl.pathname;
    const newPathname = `/tenant/${subdomain}${pathname}`;
    const url = new URL(newPathname, request.url);
    console.log(`   Reescrevendo internamente para: ${url.pathname}`);
    return NextResponse.rewrite(url);
  }
  // --- Fim da lógica para produção ---

  // Para qualquer outro caso (incluindo acesso direto a localhost:3000/), deixa passar.
  console.log(`➡️  [Middleware] Acesso direto ao domínio principal ou não tratado: ${hostname}${request.nextUrl.pathname}`);
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};