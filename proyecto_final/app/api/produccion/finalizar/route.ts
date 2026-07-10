import { NextResponse } from 'next/server';
import { finalizarLote } from '@/lib/services/produccion';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const datos = await request.json();
    const resultado = await finalizarLote({ ...datos, fecha: datos.fecha || new Date().toISOString() });
    return NextResponse.json(resultado);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
