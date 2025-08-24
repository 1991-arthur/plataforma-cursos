// src/app/actions/courseActions.ts
'use server';

import { db } from '@/lib/firebase';
import { doc, deleteDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

// Definindo interfaces para tipagem (ajuste conforme seus dados)
interface TenantData {
  id: string;
  name: string;
  subdomain: string;
  ownerId: string;
  createdAt: any;
}

interface CourseData {
  id: string;
  title: string;
  description?: string;
  price?: number;
  status: 'published' | 'draft';
  createdAt: any;
  tenantId: string;
}

/**
 * Server Action para excluir um curso, verificando a propriedade.
 * @param formData FormData contendo courseId e subdomain
 * @returns Um objeto indicando sucesso ou erro.
 */
export async function deleteCourseAction(formData: FormData) {
  console.log(`[deleteCourseAction] Iniciando exclusão de curso via FormData.`);

  try {
    // Extrair dados do FormData
    const courseId = formData.get('courseId') as string;
    const subdomain = formData.get('subdomain') as string;

    if (!courseId || !subdomain) {
      console.error('[deleteCourseAction] ID do curso ou subdomínio não fornecido.');
      return { success: false, error: 'Dados inválidos fornecidos para exclusão.' };
    }

    // --- PASSO 1: Verificar o tenant pelo subdomain ---
    const tenantsCollection = collection(db, 'tenants');
    const tenantQuery = query(tenantsCollection, where('subdomain', '==', subdomain));
    const tenantSnapshot = await getDocs(tenantQuery);

    if (tenantSnapshot.empty) {
      console.log(`[deleteCourseAction] Tenant com subdomain '${subdomain}' não encontrado.`);
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
      return { success: false, error: 'Você não tem permissão para excluir este curso.' };
    }

    // --- PASSO 4: Excluir o curso ---
    await deleteDoc(courseRef);
    console.log(`[deleteCourseAction] ✅ Curso '${courseId}' excluído com sucesso.`);

    // --- PASSO 5: Invalidar o cache da página de cursos ---
    revalidatePath(`/tenant/${subdomain}/courses`);
    console.log(`[deleteCourseAction] Cache revalidado para /tenant/${subdomain}/courses.`);

    // Retornar sucesso
    return { success: true };

  } catch (error: any) {
    console.error(`[deleteCourseAction] ❌ Erro ao excluir curso:`, error);
    return { success: false, error: 'Falha ao excluir o curso. Tente novamente.' };
  }
}