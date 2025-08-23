// src/components/tenant/CreateCourseForm.tsx
'use client'; // Isso é crucial para definir um Client Component

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // Para possíveis redirecionamentos futuros

export default function CreateCourseForm({ ownerId }: { ownerId: string }) {
  const router = useRouter();
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseSubdomain, setNewCourseSubdomain] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Para feedback visual

  const handleCreateCourse = async () => {
    if (!newCourseName.trim() || !newCourseSubdomain.trim()) {
      setError('Nome e subdomínio do curso são obrigatórios.');
      return;
    }

    // Validação básica de subdomínio (apenas letras, números e hífens)
    const subdomainRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;
    if (!subdomainRegex.test(newCourseSubdomain)) {
        setError('O subdomínio deve conter apenas letras minúsculas, números e hífens, e não pode começar ou terminar com hífen.');
        return;
    }

    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/tenant/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newCourseName.trim(),
          subdomain: newCourseSubdomain.trim().toLowerCase(), // Normaliza para minúsculas
          ownerId: ownerId,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess(result.message || 'Curso criado com sucesso!');
        // Limpa os campos do formulário
        setNewCourseName('');
        setNewCourseSubdomain('');
        // Opcional: Atualizar a lista de cursos ou redirecionar
        // router.refresh(); // Se estiver usando Server Components que buscam dados
      } else {
        // Trata erros específicos da API
        if (response.status === 409) {
            setError(result.error || 'Este subdomínio já está em uso. Escolha outro.');
        } else {
            setError(result.error || 'Erro ao criar o curso.');
        }
      }
    } catch (err: any) {
      console.error('❌ Erro de rede ao criar o curso:', err);
      setError('Erro de conexão. Verifique sua internet e tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mb-12 p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-2">Criar Novo Curso</h2>
      <p className="text-gray-600 mb-4">Adicione um novo curso à sua plataforma.</p>
      
      <div className="flex flex-col space-y-4 max-w-md">
        <input
          type="text"
          placeholder="Nome do Curso"
          value={newCourseName}
          onChange={(e) => setNewCourseName(e.target.value)}
          className="border border-gray-300 rounded p-2"
          disabled={isLoading}
        />
        <input
          type="text"
          placeholder="Subdomínio (ex: novo-curso)"
          value={newCourseSubdomain}
          onChange={(e) => setNewCourseSubdomain(e.target.value.toLowerCase().replace(/\s+/g, '-'))} // Sugestão de formatação
          className="border border-gray-300 rounded p-2"
          disabled={isLoading}
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        {success && <p className="text-green-500 text-sm">{success}</p>}
        <button
          onClick={handleCreateCourse}
          className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={isLoading}
        >
          {isLoading ? 'Criando...' : 'Criar Curso'}
        </button>
      </div>
    </div>
  );
}
