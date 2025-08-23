// src/app/tenant/[subdomain]/dashboard/courses/[courseId]/modules/edit/[id]/page.tsx
'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

export default function EditModulePage({ params }: { params: Promise<{ subdomain: string; courseId: string; id: string }> }) {
  const router = useRouter();
  // ✅ CORREÇÃO: Agora desestruturamos o objeto retornado por React.use(params) corretamente
  const { subdomain, courseId, id } = React.use(params); // 'id' é o moduleId

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [order, setOrder] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchModule = async () => {
      try {
        // ✅ CORREÇÃO: Usar 'id' (que é o moduleId) para buscar o documento
        const moduleRef = doc(db, 'modules', id);
        const moduleSnap = await getDoc(moduleRef);

        if (moduleSnap.exists() && moduleSnap.data().courseId === courseId) {
          const data = moduleSnap.data();
          setTitle(data.title || '');
          setDescription(data.description || '');
          setOrder(data.order || 1);
        } else {
          setError('Módulo não encontrado ou não pertence a este curso.');
        }
      } catch (err) {
        console.error('Erro ao buscar módulo:', err);
        setError('Falha ao carregar os dados do módulo.');
      } finally {
        setLoading(false);
      }
    };

    // ✅ CORREÇÃO: A dependência agora é 'id', não 'moduleId'
    if (id) {
      fetchModule();
    }
  }, [id, courseId]); // Dependências atualizadas

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    if (!title.trim()) {
      setError('O título do módulo é obrigatório.');
      setSubmitting(false);
      return;
    }

    try {
      // ✅ CORREÇÃO: Usar 'id' (que é o moduleId) para atualizar o documento
      const moduleRef = doc(db, 'modules', id);
      await updateDoc(moduleRef, {
        title: title.trim(),
        description: description.trim(),
        order: parseInt(order.toString(), 10),
        updatedAt: serverTimestamp(),
      });

      console.log('✅ Módulo atualizado com sucesso!');
      // Redireciona para a lista de módulos após a atualização
      router.push(`/tenant/${subdomain}/dashboard/courses/${courseId}/modules`);
      router.refresh();
    } catch (err) {
      console.error('❌ Erro ao atualizar módulo:', err);
      setError('Falha ao atualizar o módulo. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <p>Carregando dados do módulo...</p>
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
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Editar Módulo</h1>

        <form onSubmit={handleSubmit} className="bg-white shadow sm:rounded-lg p-6">
          {error && <div className="mb-4 text-red-600">{error}</div>}

          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-6">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Título do Módulo *
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                  placeholder="Ex: Introdução ao React"
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
                  placeholder="Descreva brevemente o conteúdo deste módulo..."
                />
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
              {submitting ? 'Atualizando...' : 'Atualizar Módulo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}