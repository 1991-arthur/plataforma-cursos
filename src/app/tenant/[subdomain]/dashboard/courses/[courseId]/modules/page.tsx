// src/app/tenant/[subdomain]/dashboard/courses/[courseId]/modules/page.tsx
import { notFound } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import Link from 'next/link';
import DeleteModuleButton from '@/components/tenant/DeleteModuleButton';

export default async function CourseModulesPage({ params }: { params: Promise<{ subdomain: string; courseId: string }> }) {
  const { subdomain, courseId } = await params;

  console.log(`CourseModulesPage: Acessando módulos para o curso: ${courseId} no tenant: ${subdomain}`);

  try {
    // Verificar se o curso existe e pertence ao tenant
    const courseRef = doc(db, 'courses', courseId);
    const courseSnap = await getDoc(courseRef);

    if (!courseSnap.exists() || courseSnap.data().tenantId !== subdomain) {
      console.log(`CourseModulesPage: Curso '${courseId}' não encontrado ou não pertence ao tenant '${subdomain}'.`);
      return notFound();
    }

    const courseData = courseSnap.data();

    // Buscar os módulos do curso, ordenados por 'order'
    const modulesQuery = query(
      collection(db, 'modules'),
      where('courseId', '==', courseId),
      orderBy('order', 'asc')
    );
    const modulesSnapshot = await getDocs(modulesQuery);

    const modules = modulesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log(`CourseModulesPage: Encontrados ${modules.length} módulos para o curso '${courseId}'.`);

    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Módulos - {courseData.title}</h1>
              <p className="text-gray-600">Gerencie os módulos do seu curso.</p>
            </div>
            <Link
              href={`/tenant/${subdomain}/dashboard/courses/${courseId}/modules/create`}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Criar Novo Módulo
            </Link>
          </div>

          {modules.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-500 mb-4">Nenhum módulo criado ainda para este curso.</p>
              <Link
                href={`/tenant/${subdomain}/dashboard/courses/${courseId}/modules/create`}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Crie seu primeiro módulo
              </Link>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {modules.map((module: any) => (
                  <li key={module.id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <Link href={`/tenant/${subdomain}/dashboard/courses/${courseId}/modules/${module.id}/lessons`} className="text-lg font-medium text-blue-600 hover:text-blue-800 truncate">
                          {module.order}. {module.title}
                        </Link>
                        <div className="ml-2 flex-shrink-0 flex space-x-2">
                          {/* Botões de ação: Editar, Excluir */}
                          <Link
                            href={`/tenant/${subdomain}/dashboard/courses/${courseId}/modules/edit/${module.id}`}
                            className="text-indigo-600 hover:text-indigo-900 text-sm"
                          >
                            Editar
                          </Link>
                          {/* Para exclusão, você pode criar um componente similar ao DeleteCourseButton */}
                          <DeleteModuleButton moduleId={module.id} courseId={courseId} subdomain={subdomain} />
                        </div>
                      </div>
                      {module.description && (
                        <div className="mt-2 sm:flex sm:justify-between">
                          <p className="text-sm text-gray-500 truncate">{module.description}</p>
                        </div>
                      )}
                      <div className="mt-2 text-sm text-gray-500">
                        {/* Exibir número de aulas no módulo */}
                        {/* Isso requer uma query adicional para contar as aulas */}
                        {/* Por enquanto, deixamos um placeholder */}
                        {/* <span>{countLessons(module.id)} aulas</span> */}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-6">
            <Link href={`/tenant/${subdomain}/dashboard/courses`} className="text-blue-600 hover:text-blue-800 flex items-center">
              ← Voltar para a lista de cursos
            </Link>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error(`CourseModulesPage: Erro ao buscar dados do curso '${courseId}' ou módulos:`, error);
    return notFound();
  }
}