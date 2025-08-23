// src/components/tenant/DeleteModuleButton.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DeleteModuleButton({ moduleId, courseId, subdomain }: { moduleId: string; courseId: string; subdomain: string }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    // Confirmação simples
    if (!confirm('Tem certeza que deseja excluir este módulo e todas as suas aulas? Esta ação não pode ser desfeita.')) {
      return;
    }

    setIsDeleting(true);
    setError('');

    try {
      const response = await fetch(`/api/modules/${moduleId}/delete`, {
        method: 'DELETE',
      });

      if (response.ok) {
        console.log('✅ Módulo e aulas deletados com sucesso via API.');
        // Atualiza a página para refletir a exclusão
        router.refresh();
      } else {
        const result = await response.json();
        setError(result.error || 'Falha ao excluir o módulo.');
      }
    } catch (err) {
      console.error('❌ Erro de rede ao excluir módulo:', err);
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
        className={`text-red-600 hover:text-red-900 text-sm ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isDeleting ? 'Excluindo...' : 'Excluir'}
      </button>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </>
  );
}