// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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

  // Verifica se é um subdomínio (deve ter pelo menos 3 partes: subdominio.dominio.tld)
  // Ou se é localhost (para desenvolvimento)
  if ((urlParts.length >= 3 && urlParts[0] !== 'www') || hostname === 'localhost') {
    const subdomain = urlParts[0];

    // Log para depuração (opcional)
    console.log(`✅ Acesso via subdomínio detectado: ${subdomain}`);
    console.log(`   Pathname original: ${request.nextUrl.pathname}`);
    console.log(`   URL completa original: ${request.url}`);

    // Constrói a nova URL para reescrita
    // Garante que o pathname comece com /
    const pathname = request.nextUrl.pathname;
    const newPathname = `/tenant/${subdomain}${pathname}`;

    // Cria a URL de destino para a reescrita
    const url = new URL(newPathname, request.url);

    console.log(`   Reescrevendo para: ${url.pathname}`);
    console.log('---');

    // Reescreve a URL para a página dinâmica que lidará com o tenant
    return NextResponse.rewrite(url);
  }

  // Se não for um subdomínio especial, continua normalmente
  // Isso permite que rotas como /admin, /auth, etc. funcionem normalmente no domínio principal
  console.log(`➡️  Acesso direto (sem subdomínio especial): ${hostname}${request.nextUrl.pathname}`);
  return NextResponse.next();
}

// Configura o matcher para aplicar o middleware em todas as rotas
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
