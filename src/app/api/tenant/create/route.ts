// src/app/api/tenant/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const { name, subdomain, ownerId } = await request.json();

    // Validação básica
    if (!name || !subdomain || !ownerId) {
      return NextResponse.json(
        { error: 'Nome, subdomínio e ID do proprietário são obrigatórios.' },
        { status: 400 }
      );
    }

    // Verifica se o subdomínio já existe
    const tenantRef = doc(db, 'tenants', subdomain);
    const tenantSnapshot = await getDoc(tenantRef);
    if (tenantSnapshot.exists()) {
      return NextResponse.json(
        { error: `Um tenant com o subdomínio '${subdomain}' já existe.` },
        { status: 409 }
      );
    }

    // Cria o novo tenant no Firestore
    const newTenantData = {
      name,
      subdomain,
      ownerId,
      createdAt: new Date(),
    };

    await setDoc(tenantRef, newTenantData);

    console.log(`✅ API: Tenant '${subdomain}' criado com sucesso.`);

    return NextResponse.json(
      { message: 'Tenant criado com sucesso!', tenantId: subdomain },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('❌ API: Erro ao criar tenant:', error);
    return NextResponse.json(
      { error: 'Erro interno ao criar o tenant.', details: error.message },
      { status: 500 }
    );
  }
}