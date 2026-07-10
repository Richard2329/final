import { NextResponse } from 'next/server';
import { iniciarOrden } from '@/lib/services/produccion';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const datos = await request.json();
    const resultado = await iniciarOrden({ ...datos, fecha: datos.fecha || new Date().toISOString() });
    return NextResponse.json(resultado);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
