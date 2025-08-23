// src/app/tenant/[subdomain]/dashboard/courses/edit/[id]/page.tsx
'use client'; // Este será um Client Component para o formulário

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

export default function EditCoursePage({ params }: { params: Promise<{ subdomain: string; id: string }> }) {
  // Usando React.use para lidar com Promises em Client Components no Next.js 15
  const resolvedParams = React.use(params); 
  const { subdomain, id } = resolvedParams;
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [status, setStatus] = useState('draft');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const courseRef = doc(db, 'courses', id);
        const courseSnap = await getDoc(courseRef);

        if (courseSnap.exists()) {
          const data = courseSnap.data();
          setTitle(data.title || '');
          setDescription(data.description || '');
          setPrice(data.price?.toString() || '');
          setStatus(data.status || 'draft');
        } else {
          setError('Curso não encontrado.');
        }
      } catch (err) {
        console.error('Erro ao buscar curso:', err);
        setError('Falha ao carregar os dados do curso.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCourse();
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    // Validação simples
    if (!title.trim()) {
      setError('O título do curso é obrigatório.');
      setSubmitting(false);
      return;
    }

    try {
      const courseRef = doc(db, 'courses', id);
      await updateDoc(courseRef, {
        title: title.trim(),
        description: description.trim(),
        price: price ? parseFloat(price) : 0,
        status,
        updatedAt: serverTimestamp(),
      });

      console.log('✅ Curso atualizado com sucesso!');
      // Redireciona para a lista de cursos após a atualização
      router.push(`/tenant/${subdomain}/dashboard/courses`);
      router.refresh();
    } catch (err) {
      console.error('❌ Erro ao atualizar curso:', err);
      setError('Falha ao atualizar o curso. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <p>Carregando dados do curso...</p>
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
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Editar Curso</h1>

        <form onSubmit={handleSubmit} className="bg-white shadow sm:rounded-lg p-6">
          {error && <div className="mb-4 text-red-600">{error}</div>}

          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-6">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Título do Curso *
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                  placeholder="Ex: Curso Completo de Next.js"
                />
              </div>
            </div>

            <div className="sm:col-span-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Descrição
              </label>
              <div className="mt-1">
                <textarea
                  id="description"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                  placeholder="Descreva brevemente o conteúdo do curso..."
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                Preço (R$)
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  id="price"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <div className="mt-1">
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                >
                  <option value="draft">Rascunho</option>
                  <option value="published">Publicado</option>
                </select>
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
              {submitting ? 'Atualizando...' : 'Atualizar Curso'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Import necessário para React.use no Next.js 15
import * as React from 'react';