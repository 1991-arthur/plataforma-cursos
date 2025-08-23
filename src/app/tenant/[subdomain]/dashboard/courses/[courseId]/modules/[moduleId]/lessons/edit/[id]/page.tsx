// src/app/tenant/[subdomain]/dashboard/courses/[courseId]/modules/[moduleId]/lessons/edit/[id]/page.tsx
'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

export default function EditLessonPage({ params }: { params: Promise<{ subdomain: string; courseId: string; moduleId: string; id: string }> }) {
  const router = useRouter();
  // ✅ CORREÇÃO: Agora desestruturamos o objeto retornado por React.use(params) corretamente
  const { subdomain, courseId, moduleId, id } = React.use(params); // 'id' é o lessonId

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState('text');
  const [order, setOrder] = useState(1);
  const [duration, setDuration] = useState(''); // Em minutos
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        // ✅ CORREÇÃO: Usar 'id' (que é o lessonId) para buscar o documento
        const lessonRef = doc(db, 'lessons', id);
        const lessonSnap = await getDoc(lessonRef);

        if (lessonSnap.exists() && lessonSnap.data().moduleId === moduleId) {
          const data = lessonSnap.data();
          setTitle(data.title || '');
          setContent(data.content || '');
          setType(data.type || 'text');
          setOrder(data.order || 1);
          if (data.duration) {
            setDuration(Math.floor(data.duration / 60).toString()); // Converter segundos para minutos
          }
        } else {
          setError('Aula não encontrada ou não pertence a este módulo.');
        }
      } catch (err) {
        console.error('Erro ao buscar aula:', err);
        setError('Falha ao carregar os dados da aula.');
      } finally {
        setLoading(false);
      }
    };

    // ✅ CORREÇÃO: A dependência agora é 'id', não 'lessonId'
    if (id) {
      fetchLesson();
    }
  }, [id, moduleId]); // Dependências atualizadas

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    if (!title.trim()) {
      setError('O título da aula é obrigatório.');
      setSubmitting(false);
      return;
    }

    try {
      const durationInSeconds = duration ? parseInt(duration, 10) * 60 : 0;

      // ✅ CORREÇÃO: Usar 'id' (que é o lessonId) para atualizar o documento
      const lessonRef = doc(db, 'lessons', id);
      await updateDoc(lessonRef, {
        title: title.trim(),
        content: content.trim(),
        type,
        order: parseInt(order.toString(), 10),
        duration: durationInSeconds || null,
        updatedAt: serverTimestamp(),
      });

      console.log('✅ Aula atualizada com sucesso!');
      // Redireciona para a lista de aulas após a atualização
      router.push(`/tenant/${subdomain}/dashboard/courses/${courseId}/modules/${moduleId}/lessons`);
      router.refresh();
    } catch (err) {
      console.error('❌ Erro ao atualizar aula:', err);
      setError('Falha ao atualizar a aula. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <p>Carregando dados da aula...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => router.back()}
            className="bg-gray-200 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Editar Aula</h1>

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
              disabled={submitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${submitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            >
              {submitting ? 'Atualizando...' : 'Atualizar Aula'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}