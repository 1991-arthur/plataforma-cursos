// src/app/api/modules/[id]/delete/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, deleteDoc, collection, query, where, getDocs, deleteField } from 'firebase/firestore';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params as required by Next.js 15 for dynamic route segments
    const resolvedParams = await params;
    const { id: moduleId } = resolvedParams;

    if (!moduleId) {
      return NextResponse.json({ error: 'ID do módulo é obrigatório.' }, { status: 400 });
    }

    // Verificar se o módulo existe
    const moduleRef = doc(db, 'modules', moduleId);
    const moduleSnap = await getDoc(moduleRef);

    if (!moduleSnap.exists()) {
      return NextResponse.json({ error: 'Módulo não encontrado.' }, { status: 404 });
    }

    // Excluir todas as aulas associadas ao módulo
    const lessonsQuery = query(collection(db, 'lessons'), where('moduleId', '==', moduleId));
    const lessonsSnapshot = await getDocs(lessonsQuery);
    
    // Em produção, você pode querer fazer isso em lotes para melhor performance
    const deleteLessonPromises = lessonsSnapshot.docs.map(lessonDoc => 
      deleteDoc(lessonDoc.ref)
    );
    await Promise.all(deleteLessonPromises);
    console.log(`✅ ${lessonsSnapshot.size} aulas do módulo ${moduleId} deletadas.`);

    // Deletar o módulo
    await deleteDoc(moduleRef);

    console.log(`✅ Módulo com ID ${moduleId} deletado com sucesso.`);
    return NextResponse.json({ message: 'Módulo e suas aulas deletados com sucesso.' }, { status: 200 });
  } catch (error) {
    console.error('❌ Erro ao deletar módulo:', error);
    return NextResponse.json({ error: 'Erro interno ao deletar o módulo e suas aulas.' }, { status: 500 });
  }
}