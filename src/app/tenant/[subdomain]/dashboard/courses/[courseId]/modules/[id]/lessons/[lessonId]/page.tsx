// src/app/tenant/[subdomain]/dashboard/courses/[courseId]/modules/[moduleId]/lessons/[lessonId]/page.tsx
import { notFound } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Link from 'next/link';

export default async function LessonViewPage({ params }: { params: Promise<{ subdomain: string; courseId: string; moduleId: string; lessonId: string }> }) {
  const { subdomain, courseId, moduleId, lessonId } = await params;

  console.log(`LessonViewPage: Acessando aula '${lessonId}' do módulo '${moduleId}' do curso '${courseId}' no tenant '${subdomain}'`);

  try {
    // Verificar se a aula existe e pertence ao módulo
    const lessonRef = doc(db, 'lessons', lessonId);
    const lessonSnap = await getDoc(lessonRef);

    if (!lessonSnap.exists() || lessonSnap.data().moduleId !== moduleId) {
      console.log(`LessonViewPage: Aula '${lessonId}' não encontrada ou não pertence ao módulo '${moduleId}'.`);
      return notFound();
    }

    const lessonData = lessonSnap.data();

    // Verificar se o módulo pertence ao curso (segurança adicional)
    if (lessonData.courseId !== courseId) {
      console.log(`LessonViewPage: Aula '${lessonId}' não pertence ao curso '${courseId}'.`);
      return notFound();
    }

    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Link href={`/tenant/${subdomain}/dashboard/courses/${courseId}/modules/${moduleId}/lessons`} className="text-blue-600 hover:text-blue-800 flex items-center text-sm">
              ← Voltar para as aulas
            </Link>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h1 className="text-2xl leading-6 font-bold text-gray-900">{lessonData.title}</h1>
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${lessonData.type === 'video' ? 'bg-purple-100 text-purple-800' : lessonData.type === 'text' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {lessonData.type}
                </span>
                {lessonData.duration && (
                  <span className="ml-2">
                    Duração: {Math.floor(lessonData.duration / 60)}min {lessonData.duration % 60}s
                  </span>
                )}
              </div>
            </div>
            <div className="px-4 py-5 sm:px-6">
              {lessonData.type === 'video' && lessonData.content ? (
                <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-lg overflow-hidden">
                  {/* Exemplo para YouTube. Adapte conforme o tipo de vídeo */}
                  {lessonData.content.includes('youtube.com') || lessonData.content.includes('youtu.be') ? (
                    <iframe
                      src={lessonData.content.replace('watch?v=', 'embed/')}
                      title={lessonData.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    ></iframe>
                  ) : (
                    <p className="text-gray-500 flex items-center justify-center h-full">
                      Player de vídeo para {lessonData.content} não implementado. Insira um link do YouTube.
                    </p>
                  )}
                </div>
              ) : lessonData.type === 'text' && lessonData.content ? (
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-line">{lessonData.content}</p>
                </div>
              ) : lessonData.type === 'pdf' ? (
                <div className="text-center py-10">
                  <p className="text-gray-500">Visualizador de PDF para {lessonData.content} não implementado.</p>
                  {lessonData.content && (
                    <a href={lessonData.content} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                      Abrir PDF
                    </a>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 italic">Nenhum conteúdo disponível para esta aula.</p>
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-between">
            <Link href={`/tenant/${subdomain}/dashboard/courses/${courseId}/modules/${moduleId}/lessons`} className="text-blue-600 hover:text-blue-800 flex items-center">
              ← Voltar para as aulas
            </Link>
            <Link href={`/tenant/${subdomain}/dashboard/courses/${courseId}/modules/${moduleId}/lessons/edit/${lessonId}`} className="text-indigo-600 hover:text-indigo-800 flex items-center">
              Editar Aula
            </Link>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error(`LessonViewPage: Erro ao buscar dados da aula '${lessonId}':`, error);
    return notFound();
  }
}