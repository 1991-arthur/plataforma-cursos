// src/app/page.tsx
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Cabeçalho */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Minha Plataforma de Cursos</h1>
          <nav>
            {/* Espaço para links futuros, se necessário */}
          </nav>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Bem-vindo à sua Plataforma de Cursos
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Gerencie seus cursos e alunos de forma centralizada.
            </p>
          </div>

          <div className="mt-8">
            {/* Botão usando o componente customizado */}
            <Link href="/login" passHref>
              <Button className="w-full">
                Acessar Área Administrativa
              </Button>
            </Link>
          </div>

          <div className="mt-6 text-sm text-gray-500">
            <p>
              Não tem uma conta? <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">Registre-se</Link>
            </p>
          </div>
        </div>
      </main>

      {/* Rodapé */}
      <footer className="bg-white py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Minha Plataforma de Cursos. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}