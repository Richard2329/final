import { NextResponse } from 'next/server';
import { descontarStock } from '@/lib/services/inventario';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { producto, pesoObjetivoGramos, fecha } = await request.json();

    if (!producto || !pesoObjetivoGramos) {
      return NextResponse.json({ error: 'Faltan campos: producto, pesoObjetivoGramos' }, { status: 400 });
    }

    const nuevoStock = await descontarStock(producto, pesoObjetivoGramos, fecha || new Date().toISOString());
    return NextResponse.json({ nuevoStock });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
