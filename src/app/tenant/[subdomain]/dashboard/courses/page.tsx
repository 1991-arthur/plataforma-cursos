// src/app/tenant/[subdomain]/dashboard/courses/page.tsx
import { notFound } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import Link from 'next/link';
import DeleteCourseButton from '@/components/tenant/DeleteCourseButton';

export default async function CoursesPage({ params }: { params: Promise<{ subdomain: string }> }) {
  const { subdomain } = await params;

  console.log(`CoursesPage: Acessando cursos para o tenant: ${subdomain}`);

  // Verifica se o subdomínio é válido
  if (['admin', 'auth'].includes(subdomain)) {
    console.log(`CoursesPage: Subdomínio '${subdomain}' é reservado.`);
    return notFound();
  }

  // Busca o documento do tenant no Firestore com base no subdomínio
  try {
    const tenantRef = doc(db, 'tenants', subdomain);
    const tenantSnapshot = await getDoc(tenantRef);

    if (!tenantSnapshot.exists()) {
      console.log(`CoursesPage: Tenant '${subdomain}' não encontrado no Firestore.`);
      return notFound();
    }

    const tenantData = tenantSnapshot.data();
    const tenantId = tenantSnapshot.id; // O ID do documento é o subdomain

    // Busca os cursos associados a este tenant
    const coursesQuery = query(collection(db, 'courses'), where('tenantId', '==', tenantId));
    const coursesSnapshot = await getDocs(coursesQuery);

    const courses = coursesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log(`CoursesPage: Encontrados ${courses.length} cursos para o tenant '${subdomain}'.`);

    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Gerenciar Cursos - {tenantData.name}</h1>
            <Link
              href={`/tenant/${subdomain}/dashboard/courses/create`}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Criar Novo Curso
            </Link>
          </div>

          {courses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">Nenhum curso criado ainda.</p>
              <Link
                href={`/tenant/${subdomain}/dashboard/courses/create`}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Crie seu primeiro curso
              </Link>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {courses.map((course: any) => (
                  <li key={course.id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium text-blue-600 truncate">
                          {course.title}
                        </div>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${course.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {course.status === 'published' ? 'Publicado' : 'Rascunho'}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            Preço: R$ {course.price?.toFixed(2) || 'Gratuito'}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <p>
                            Criado em: {course.createdAt?.toDate().toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      {/* Linha modificada: Adicionado o link "Gerenciar Conteúdo" */}
                      <div className="mt-4 flex space-x-3">
                        <Link
                          href={`/tenant/${subdomain}/dashboard/courses/${course.id}/modules`}
                          className="text-green-600 hover:text-green-900 font-medium"
                        >
                          Gerenciar Conteúdo
                        </Link>
                        <Link
                          href={`/tenant/${subdomain}/dashboard/courses/edit/${course.id}`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Editar
                        </Link>
                        <DeleteCourseButton courseId={course.id} subdomain={subdomain} />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error(`CoursesPage: Erro ao buscar dados do tenant '${subdomain}' ou cursos:`, error);
    return notFound();
  }
}