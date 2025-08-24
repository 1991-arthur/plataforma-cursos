// src/app/actions/lessonActions.ts
'use server';

import { db } from '@/lib/firebase';
import { doc, deleteDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

interface LessonData {
  id: string;
  moduleId: string;
  title: string;
  // ... outros campos
}

interface ModuleData {
  id: string;
  courseId: string;
  // ... outros campos
}

interface CourseData {
  id: string;
  tenantId: string;
  // ... outros campos
}

interface TenantData {
  id: string;
  subdomain: string;
  // ... outros campos
}

/**
 * Server Action para excluir uma aula.
 * @param formData FormData contendo lessonId, moduleId, courseId e subdomain
 * @returns Um objeto indicando sucesso ou erro.
 */
export async function deleteLessonAction(formData: FormData) {
  console.log(`[deleteLessonAction] Iniciando exclusão de aula via FormData.`);

  try {
    // Extrair dados do FormData
    const lessonId = formData.get('lessonId') as string;
    const moduleId = formData.get('moduleId') as string;
    const courseId = formData.get('courseId') as string;
    const subdomain = formData.get('subdomain') as string;

    if (!lessonId || !moduleId || !courseId || !subdomain) {
      console.error('[deleteLessonAction] Dados inválidos fornecidos para exclusão.');
      return { success: false, error: 'Dados inválidos fornecidos para exclusão.' };
    }

    // --- PASSO 1: Verificar o tenant pelo subdomain ---
    const tenantsCollection = collection(db, 'tenants');
    const tenantQuery = query(tenantsCollection, where('subdomain', '==', subdomain));
    const tenantSnapshot = await getDocs(tenantQuery);

    if (tenantSnapshot.empty) {
      console.log(`[deleteLessonAction] Tenant com subdomain '${subdomain}' não encontrado.`);
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
      console.log(`[deleteLessonAction] Curso com ID '${courseId}' não encontrado.`);
      return { success: false, error: 'Curso não encontrado.' };
    }

    const courseData: CourseData = {
      id: courseSnap.id,
      ...(courseSnap.data() as Omit<CourseData, 'id'>)
    };

    // --- PASSO 3: Verificar se o curso pertence ao tenant ---
    if (courseData.tenantId !== tenantData.id) {
      console.log(`[deleteLessonAction] Curso '${courseId}' não pertence ao tenant '${subdomain}' (ID: ${tenantData.id}).`);
      return { success: false, error: 'Você não tem permissão para excluir esta aula.' };
    }

    // --- PASSO 4: Verificar se o módulo existe ---
    const moduleRef = doc(db, 'modules', moduleId);
    const moduleSnap = await getDoc(moduleRef);

    if (!moduleSnap.exists()) {
      console.log(`[deleteLessonAction] Módulo com ID '${moduleId}' não encontrado.`);
      return { success: false, error: 'Módulo não encontrado.' };
    }

    const moduleData: ModuleData = {
      id: moduleSnap.id,
      ...(moduleSnap.data() as Omit<ModuleData, 'id'>)
    };

    // --- PASSO 5: Verificar se o módulo pertence ao curso ---
    if (moduleData.courseId !== courseId) {
      console.log(`[deleteLessonAction] Módulo '${moduleId}' não pertence ao curso '${courseId}'.`);
      return { success: false, error: 'Você não tem permissão para excluir esta aula.' };
    }

    // --- PASSO 6: Verificar se a aula existe ---
    const lessonRef = doc(db, 'lessons', lessonId);
    const lessonSnap = await getDoc(lessonRef);

    if (!lessonSnap.exists()) {
      console.log(`[deleteLessonAction] Aula com ID '${lessonId}' não encontrada.`);
      return { success: false, error: 'Aula não encontrada.' };
    }

    const lessonData: LessonData = {
      id: lessonSnap.id,
      ...(lessonSnap.data() as Omit<LessonData, 'id'>)
    };

    // --- PASSO 7: Verificar se a aula pertence ao módulo ---
    if (lessonData.moduleId !== moduleId) {
      console.log(`[deleteLessonAction] Aula '${lessonId}' não pertence ao módulo '${moduleId}'.`);
      return { success: false, error: 'Você não tem permissão para excluir esta aula.' };
    }

    // --- PASSO 8: Excluir a aula ---
    await deleteDoc(lessonRef);
    console.log(`[deleteLessonAction] ✅ Aula '${lessonId}' excluída com sucesso.`);

    // --- PASSO 9: Invalidar o cache da página de aulas ---
    revalidatePath(`/tenant/${subdomain}/courses/${courseId}/modules/${moduleId}/lessons`);
    console.log(`[deleteLessonAction] Cache revalidado para /tenant/${subdomain}/courses/${courseId}/modules/${moduleId}/lessons.`);

    // Retornar sucesso
    return { success: true, lessonTitle: lessonData.title };

  } catch (error: any) {
    console.error(`[deleteLessonAction] ❌ Erro ao excluir aula:`, error);
    return { success: false, error: 'Falha ao excluir a aula. Tente novamente.' };
  }
}