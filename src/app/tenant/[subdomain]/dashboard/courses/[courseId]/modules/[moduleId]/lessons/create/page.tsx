// src/app/tenant/[subdomain]/dashboard/courses/[courseId]/modules/[moduleId]/lessons/create/page.tsx
'use client';

import * as React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function CreateLessonPage({ params }: { params: Promise<{ subdomain: string; courseId: string; moduleId: string }> }) {
  const router = useRouter();
  // Usando React.use para acessar os parâmetros dinâmicos em um Client Component no Next.js 15
  const { subdomain, courseId, moduleId } = React.use(params);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState(''); // Pode ser texto, URL de vídeo, etc.
  const [type, setType] = useState('text'); // 'video', 'text', 'pdf', 'quiz'
  const [order, setOrder] = useState(1);
  const [duration, setDuration] = useState(''); // Em minutos, por simplicidade
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!title.trim()) {
      setError('O título da aula é obrigatório.');
      setIsLoading(false);
      return;
    }

    try {
      const durationInSeconds = duration ? parseInt(duration, 10) * 60 : 0;

      const newLesson = {
        moduleId,
        courseId, // Redundante, mas útil para queries diretas
        title: title.trim(),
        content: content.trim(),
        type,
        order: parseInt(order.toString(), 10),
        duration: durationInSeconds || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'lessons'), newLesson);
      console.log('✅ Aula criada com ID:', docRef.id);

      // Redirecionar de volta para a lista de aulas do módulo
      router.push(`/tenant/${subdomain}/dashboard/courses/${courseId}/modules/${moduleId}/lessons`);
      router.refresh();
    } catch (err: any) {
      console.error('❌ Erro ao criar aula:', err);
      setError('Falha ao criar a aula. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Criar Nova Aula</h1>

        <form onSubmit={handleSubmit} className="bg-white shadow sm:rounded-lg p-6">
          {error && <div className="mb-4 text-red-600">{error}</div>}

          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-6">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Título da Aula *
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                  placeholder="Ex: Introdução ao Next.js App Router"
                />
              </div>
            </div>

            <div className="sm:col-span-6">
              <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                Tipo de Conteúdo
              </label>
              <div className="mt-1">
                <select
                  id="type"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                >
                  <option value="text">Texto</option>
                  <option value="video">Vídeo</option>
                  <option value="pdf">PDF</option>
                  <option value="quiz">Quiz</option>
                </select>
              </div>
            </div>

            <div className="sm:col-span-6">
              <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                Conteúdo
              </label>
              <div className="mt-1">
                <textarea
                  id="content"
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                  placeholder={type === 'video' ? 'URL do vídeo (YouTube, Vimeo, etc.)' : type === 'text' ? 'Digite o conteúdo da aula...' : 'Informações adicionais...'}
                />
                <p className="mt-2 text-sm text-gray-500">
                  {type === 'video' ? 'Cole o link completo do vídeo.' : 'Insira o conteúdo textual da aula.'}
                </p>
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="order" className="block text-sm font-medium text-gray-700">
                Ordem de Exibição
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  id="order"
                  min="1"
                  value={order}
                  onChange={(e) => setOrder(parseInt(e.target.value) || 1)}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                Duração (minutos)
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  id="duration"
                  min="0"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                  placeholder="Ex: 15"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="bg-gray-200 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            >
              {isLoading ? 'Criando...' : 'Criar Aula'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}