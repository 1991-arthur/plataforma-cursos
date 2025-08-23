// src/app/tenant/[subdomain]/dashboard/courses/[courseId]/modules/[id]/page.tsx
import { redirect } from 'next/navigation';

/**
 * Página principal de um módulo.
 * Redireciona automaticamente para a lista de aulas do módulo.
 */
export default async function ModulePage({ params }: { params: Promise<{ id: string; courseId: string; subdomain: string }> }) {
  // No Next.js 15, params é uma Promise e deve ser awaited em Server Components
  const { id: moduleId, courseId, subdomain } = await params;
  
  // Redireciona para a lista de aulas do módulo
  // Esta é uma escolha de design comum: ao acessar um módulo, o foco principal é gerenciar suas aulas.
  redirect(`/tenant/${subdomain}/dashboard/courses/${courseId}/modules/${moduleId}/lessons`);
}