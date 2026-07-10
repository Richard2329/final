import { NextResponse } from 'next/server';
import { consultarInventario } from '@/lib/services/inventario';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await consultarInventario();
    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
