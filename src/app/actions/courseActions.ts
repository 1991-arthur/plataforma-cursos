// src/app/actions/courseActions.ts
'use server';

import { db } from '@/lib/firebase';
import { doc, deleteDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import { notFound } from 'next/navigation';

// Definindo interfaces para tipagem (ajuste conforme seus dados)
interface TenantData {
  id: string;
  name: string;
  subdomain: string;
  ownerId: string;
  createdAt: any;
  // settings?: { ... };
}

interface CourseData {
  id: string;
  title: string;
  description?: string;
  price?: number;
  status: 'published' | 'draft';
  createdAt: any;
  tenantId: string; // ID do documento do tenant no Firestore
  // ... outros campos
}

/**
 * Server Action para excluir um curso, verificando a propriedade.
 * @param courseId O ID do curso a ser excluído.
 * @param subdomain O subdomínio do tenant atual (para verificação).
 * @returns Um objeto indicando sucesso ou erro.
 */
export async function deleteCourseAction(courseId: string, subdomain: string) {
  console.log(`[deleteCourseAction] Iniciando exclusão do curso '${courseId}' para o tenant '${subdomain}'.`);

  if (!courseId || !subdomain) {
    console.error('[deleteCourseAction] ID do curso ou subdomínio não fornecido.');
    return { success: false, error: 'Dados inválidos fornecidos para exclusão.' };
  }

  try {
    // --- PASSO 1: Verificar o tenant pelo subdomain ---
    const tenantsCollection = collection(db, 'tenants');
    const tenantQuery = query(tenantsCollection, where('subdomain', '==', subdomain));
    const tenantSnapshot = await getDocs(tenantQuery);

    if (tenantSnapshot.empty) {
      console.log(`[deleteCourseAction] Tenant com subdomain '${subdomain}' não encontrado.`);
      // Em uma Server Action, você pode optar por retornar um erro ou lançar notFound
      // Retornar um erro é mais apropriado para lidar com isso no cliente
      return { success: false, error: 'Tenant não encontrado.' };
    }

    const tenantDoc = tenantSnapshot.docs[0];
    const tenantData: TenantData = {
      id: tenantDoc.id,
      ...(tenantDoc.data() as Omit<TenantData, 'id'>)
    };

    // --- PASSO 2: Verificar se o curso existe ---
    const courseRef = doc(db, 'courses', courseId);
    const courseSnap = await getDoc(courseRef);

    if (!courseSnap.exists()) {
      console.log(`[deleteCourseAction] Curso com ID '${courseId}' não encontrado.`);
      return { success: false, error: 'Curso não encontrado.' };
    }

    const courseData: CourseData = {
      id: courseSnap.id,
      ...(courseSnap.data() as Omit<CourseData, 'id'>)
    };

    // --- PASSO 3: Verificar se o curso pertence ao tenant ---
    if (courseData.tenantId !== tenantData.id) {
      console.log(`[deleteCourseAction] Curso '${courseId}' não pertence ao tenant '${subdomain}' (ID: ${tenantData.id}).`);
      // Retornar um erro específico para permissão negada
      return { success: false, error: 'Você não tem permissão para excluir este curso.' };
    }

    // --- PASSO 4: Excluir o curso ---
    await deleteDoc(courseRef);
    console.log(`[deleteCourseAction] ✅ Curso '${courseId}' excluído com sucesso.`);

    // --- PASSO 5: Invalidar o cache da página de cursos para forçar uma atualização ---
    // Isso garante que a lista de cursos seja atualizada após a exclusão
    revalidatePath(`/tenant/${subdomain}/courses`);
    console.log(`[deleteCourseAction] Cache revalidado para /tenant/${subdomain}/courses.`);

    // Retornar sucesso
    return { success: true };

  } catch (error: any) {
    console.error(`[deleteCourseAction] ❌ Erro ao excluir curso '${courseId}':`, error);
    // Retornar uma mensagem de erro genérica para o cliente
    return { success: false, error: 'Falha ao excluir o curso. Tente novamente.' };
  }
}