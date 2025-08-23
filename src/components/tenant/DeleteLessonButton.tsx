// src/components/tenant/DeleteLessonButton.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DeleteLessonButton({ lessonId, moduleId, courseId, subdomain }: { lessonId: string; moduleId: string; courseId: string; subdomain: string }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    // Confirmação simples
    if (!confirm('Tem certeza que deseja excluir esta aula? Esta ação não pode ser desfeita.')) {
      return;
    }

    setIsDeleting(true);
    setError('');

    try {
      const response = await fetch(`/api/lessons/${lessonId}/delete`, {
        method: 'DELETE',
      });

      if (response.ok) {
        console.log('✅ Aula deletada com sucesso via API.');
        // Atualiza a página para refletir a exclusão
        router.refresh();
      } else {
        const result = await response.json();
        setError(result.error || 'Falha ao excluir a aula.');
      }
    } catch (err) {
      console.error('❌ Erro de rede ao excluir aula:', err);
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className={`text-red-600 hover:text-red-900 ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isDeleting ? 'Excluindo...' : 'Excluir'}
      </button>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </>
  );
}