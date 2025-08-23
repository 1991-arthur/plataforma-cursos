// src/app/tenant/[subdomain]/dashboard/courses/[courseId]/modules/[id]/lessons/page.tsx
// (Note a mudança no caminho do arquivo refletindo [id] em vez de [moduleId])
import { notFound } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import Link from 'next/link';
import DeleteLessonButton from '@/components/tenant/DeleteLessonButton';

export default async function ModuleLessonsPage({ params }: { params: Promise<{ subdomain: string; courseId: string; id: string }> }) {
  // ✅ CORREÇÃO 1: O tipo agora reflete que o parâmetro dinâmico é 'id'
  // ✅ CORREÇÃO 2: Desestruturamos 'id' e o renomeamos para 'moduleId' para clareza
  const { subdomain, courseId, id: moduleId } = await params;

  console.log(`ModuleLessonsPage: Acessando aulas para o módulo: ${moduleId} do curso: ${courseId} no tenant: ${subdomain}`);

  try {
    // Verificar se o módulo existe e pertence ao curso
    // ✅ CORREÇÃO 3: Usamos 'moduleId' (que veio de 'id') para buscar o documento
    const moduleRef = doc(db, 'modules', moduleId);
    const moduleSnap = await getDoc(moduleRef);

    if (!moduleSnap.exists() || moduleSnap.data().courseId !== courseId) {
      console.log(`ModuleLessonsPage: Módulo '${moduleId}' não encontrado ou não pertence ao curso '${courseId}'.`);
      return notFound();
    }

    const moduleData = moduleSnap.data();

    // Verificar se o curso existe e pertence ao tenant (segurança adicional)
    const courseRef = doc(db, 'courses', courseId);
    const courseSnap = await getDoc(courseRef);
    if (!courseSnap.exists() || courseSnap.data().tenantId !== subdomain) {
      console.log(`ModuleLessonsPage: Curso '${courseId}' não encontrado ou não pertence ao tenant '${subdomain}'.`);
      return notFound();
    }

    const courseData = courseSnap.data();

    // Buscar as aulas do módulo, ordenadas por 'order'
    // ✅ CORREÇÃO 4: Usamos 'moduleId' (que veio de 'id') na query
    const lessonsQuery = query(
      collection(db, 'lessons'),
      where('moduleId', '==', moduleId),
      orderBy('order', 'asc')
    );
    const lessonsSnapshot = await getDocs(lessonsQuery);

    const lessons = lessonsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log(`ModuleLessonsPage: Encontradas ${lessons.length} aulas para o módulo '${moduleId}'.`);

    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Aulas - {moduleData.title}</h1>
              <p className="text-gray-600">Curso: {courseData.title}</p>
            </div>
            <Link
              href={`/tenant/${subdomain}/dashboard/courses/${courseId}/modules/${moduleId}/lessons/create`}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Criar Nova Aula
            </Link>
          </div>

          {lessons.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-500 mb-4">Nenhuma aula criada ainda para este módulo.</p>
              <Link
                href={`/tenant/${subdomain}/dashboard/courses/${courseId}/modules/${moduleId}/lessons/create`}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Crie sua primeira aula
              </Link>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {lessons.map((lesson: any) => (
                  <li key={lesson.id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        {/* Título da aula como link para visualização */}
                        <Link href={`/tenant/${subdomain}/dashboard/courses/${courseId}/modules/${moduleId}/lessons/${lesson.id}`} className="text-sm font-medium text-blue-600 hover:text-blue-800 truncate">
                          {lesson.order}. {lesson.title}
                        </Link>
                        <div className="ml-2 flex-shrink-0 flex">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${lesson.type === 'video' ? 'bg-purple-100 text-purple-800' : lesson.type === 'text' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {lesson.type}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          {lesson.duration && (
                            <p className="flex items-center text-sm text-gray-500">
                              Duração: {Math.floor(lesson.duration / 60)}min {lesson.duration % 60}s
                            </p>
                          )}
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <p>
                            Criada em: {lesson.createdAt?.toDate().toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 flex space-x-3">
                        {/* Botões de ação: Editar, Excluir */}
                        <Link
                          href={`/tenant/${subdomain}/dashboard/courses/${courseId}/modules/${moduleId}/lessons/edit/${lesson.id}`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Editar
                        </Link>
                        {/* Passando 'moduleId' para o componente */}
                        <DeleteLessonButton lessonId={lesson.id} moduleId={moduleId} courseId={courseId} subdomain={subdomain} />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-6 flex space-x-4">
            <Link href={`/tenant/${subdomain}/dashboard/courses/${courseId}/modules`} className="text-blue-600 hover:text-blue-800 flex items-center">
              ← Voltar para os módulos
            </Link>
            <Link href={`/tenant/${subdomain}/dashboard/courses`} className="text-blue-600 hover:text-blue-800 flex items-center">
              ← Voltar para a lista de cursos
            </Link>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error(`ModuleLessonsPage: Erro ao buscar dados do módulo '${moduleId}', curso '${courseId}' ou aulas:`, error);
    return notFound();
  }
}