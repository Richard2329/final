import { NextResponse } from 'next/server';
import { reanudarOrdenPausada } from '@/lib/services/produccion';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const resultado = await reanudarOrdenPausada();
    if (!resultado.ok) {
      return NextResponse.json(resultado, { status: 400 });
    }
    return NextResponse.json(resultado);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
