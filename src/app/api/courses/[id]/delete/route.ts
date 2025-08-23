// src/app/api/courses/[id]/delete/route.ts
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
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json({ error: 'ID do curso é obrigatório.' }, { status: 400 });
    }

    // Verificar se o curso existe antes de deletar
    const courseRef = doc(db, 'courses', id);
    const courseSnap = await getDoc(courseRef);

    if (!courseSnap.exists()) {
      return NextResponse.json({ error: 'Curso não encontrado.' }, { status: 404 });
    }

    // Deletar o curso
    await deleteDoc(courseRef);

    console.log(`✅ Curso com ID ${id} deletado com sucesso.`);
    return NextResponse.json({ message: 'Curso deletado com sucesso.' }, { status: 200 });
  } catch (error) {
    console.error('❌ Erro ao deletar curso:', error);
    return NextResponse.json({ error: 'Erro interno ao deletar o curso.' }, { status: 500 });
  }
}