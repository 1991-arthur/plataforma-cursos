// src/app/api/lessons/[id]/delete/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, deleteDoc, getDoc } from 'firebase/firestore';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params as required by Next.js 15 for dynamic route segments
    const resolvedParams = await params;
    const { id: lessonId } = resolvedParams;

    if (!lessonId) {
      return NextResponse.json({ error: 'ID da aula é obrigatório.' }, { status: 400 });
    }

    // Verificar se a aula existe
    const lessonRef = doc(db, 'lessons', lessonId);
    const lessonSnap = await getDoc(lessonRef);

    if (!lessonSnap.exists()) {
      return NextResponse.json({ error: 'Aula não encontrada.' }, { status: 404 });
    }

    // Deletar a aula
    await deleteDoc(lessonRef);

    console.log(`✅ Aula com ID ${lessonId} deletada com sucesso.`);
    return NextResponse.json({ message: 'Aula deletada com sucesso.' }, { status: 200 });
  } catch (error) {
    console.error('❌ Erro ao deletar aula:', error);
    return NextResponse.json({ error: 'Erro interno ao deletar a aula.' }, { status: 500 });
  }
}