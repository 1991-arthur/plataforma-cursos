// src/app/actions/moduleActions.ts
'use server';

import { db } from '@/lib/firebase';
import { doc, deleteDoc, getDoc, collection, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

interface ModuleData {
  id: string;
  courseId: string;
  title: string;
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
 * Server Action para excluir um módulo e todas as suas aulas.
 * @param formData FormData contendo moduleId, courseId e subdomain
 * @returns Um objeto indicando sucesso ou erro.
 */
export async function deleteModuleAction(formData: FormData) {
  console.log(`[deleteModuleAction] Iniciando exclusão de módulo via FormData.`);

  try {
    // Extrair dados do FormData
    const moduleId = formData.get('moduleId') as string;
    const courseId = formData.get('courseId') as string;
    const subdomain = formData.get('subdomain') as string;

    if (!moduleId || !courseId || !subdomain) {
      console.error('[deleteModuleAction] Dados inválidos fornecidos para exclusão.');
      return { success: false, error: 'Dados inválidos fornecidos para exclusão.' };
    }

    // --- PASSO 1: Verificar o tenant pelo subdomain ---
    const tenantsCollection = collection(db, 'tenants');
    const tenantQuery = query(tenantsCollection, where('subdomain', '==', subdomain));
    const tenantSnapshot = await getDocs(tenantQuery);

    if (tenantSnapshot.empty) {
      console.log(`[deleteModuleAction] Tenant com subdomain '${subdomain}' não encontrado.`);
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
      console.log(`[deleteModuleAction] Curso com ID '${courseId}' não encontrado.`);
      return { success: false, error: 'Curso não encontrado.' };
    }

    const courseData: CourseData = {
      id: courseSnap.id,
      ...(courseSnap.data() as Omit<CourseData, 'id'>)
    };

    // --- PASSO 3: Verificar se o curso pertence ao tenant ---
    if (courseData.tenantId !== tenantData.id) {
      console.log(`[deleteModuleAction] Curso '${courseId}' não pertence ao tenant '${subdomain}' (ID: ${tenantData.id}).`);
      return { success: false, error: 'Você não tem permissão para excluir este módulo.' };
    }

    // --- PASSO 4: Verificar se o módulo existe ---
    const moduleRef = doc(db, 'modules', moduleId);
    const moduleSnap = await getDoc(moduleRef);

    if (!moduleSnap.exists()) {
      console.log(`[deleteModuleAction] Módulo com ID '${moduleId}' não encontrado.`);
      return { success: false, error: 'Módulo não encontrado.' };
    }

    const moduleData: ModuleData = {
      id: moduleSnap.id,
      ...(moduleSnap.data() as Omit<ModuleData, 'id'>)
    };

    // --- PASSO 5: Verificar se o módulo pertence ao curso ---
    if (moduleData.courseId !== courseId) {
      console.log(`[deleteModuleAction] Módulo '${moduleId}' não pertence ao curso '${courseId}'.`);
      return { success: false, error: 'Você não tem permissão para excluir este módulo.' };
    }

    // --- PASSO 6: Excluir todas as aulas do módulo ---
    const lessonsQuery = query(
      collection(db, 'lessons'),
      where('moduleId', '==', moduleId)
    );
    const lessonsSnapshot = await getDocs(lessonsQuery);
    
    console.log(`[deleteModuleAction] Encontradas ${lessonsSnapshot.size} aulas para excluir.`);

    // Usar batch write para operações em lote
    const batch = writeBatch(db);
    
    // Adicionar todas as aulas para exclusão no batch
    lessonsSnapshot.docs.forEach((lessonDoc) => {
      batch.delete(lessonDoc.ref);
    });
    
    // Executar a exclusão em lote das aulas
    if (!lessonsSnapshot.empty) {
      await batch.commit();
      console.log(`[deleteModuleAction] ✅ ${lessonsSnapshot.size} aulas excluídas.`);
    }

    // --- PASSO 7: Excluir o módulo ---
    await deleteDoc(moduleRef);
    console.log(`[deleteModuleAction] ✅ Módulo '${moduleId}' excluído com sucesso.`);

    // --- PASSO 8: Invalidar o cache da página de módulos ---
    revalidatePath(`/tenant/${subdomain}/courses/${courseId}/modules`);
    console.log(`[deleteModuleAction] Cache revalidado para /tenant/${subdomain}/courses/${courseId}/modules.`);

    // Retornar sucesso
    return { success: true, moduleTitle: moduleData.title };

  } catch (error: any) {
    console.error(`[deleteModuleAction] ❌ Erro ao excluir módulo:`, error);
    return { success: false, error: 'Falha ao excluir o módulo. Tente novamente.' };
  }
}