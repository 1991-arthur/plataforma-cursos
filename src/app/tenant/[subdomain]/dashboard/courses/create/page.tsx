// src/app/tenant/[subdomain]/dashboard/courses/create/page.tsx
'use client'; // Este será um Client Component

import * as React from 'react'; // Import necessário para React.use
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function CreateCoursePage({ params }: { params: Promise<{ subdomain: string }> }) {
  const router = useRouter();

  // ✅ CORREÇÃO: Use React.use para "desembrulhar" a Promise params em um Client Component
  const { subdomain } = React.use(params);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [status, setStatus] = useState('draft');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validação simples
    if (!title.trim()) {
      setError('O título do curso é obrigatório.');
      setIsLoading(false);
      return;
    }

    try {
      // Adiciona o novo curso ao Firestore
      const newCourse = {
        tenantId: subdomain, // Associando ao tenant pelo subdomain
        title: title.trim(),
        description: description.trim(),
        price: price ? parseFloat(price) : 0,
        status,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        // modules: [], // Inicialmente vazio
      };

      const docRef = await addDoc(collection(db, 'courses'), newCourse);
      console.log('✅ Curso criado com ID:', docRef.id);

      // Redireciona para a lista de cursos após a criação
      router.push(`/tenant/${subdomain}/dashboard/courses`);
      router.refresh(); // Atualiza os dados da página de listagem
    } catch (err: any) {
      console.error('❌ Erro ao criar curso:', err);
      setError('Falha ao criar o curso. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Criar Novo Curso</h1>

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
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            >
              {isLoading ? 'Criando...' : 'Criar Curso'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}