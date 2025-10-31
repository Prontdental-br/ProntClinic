import { NextResponse } from 'next/server';

import { PromotionalCode } from '@/app/api/db/models';
import authMiddleware from '@/app/api/middleware/authMiddleware';


async function getByNameCode(req: Request) {
  try {
    const name = (req.url?.split('/').at(-1)) || '';

    if (!name) {
      return NextResponse.json({ error: 'Nome do cupom é obrigatório' }, { status: 400 });
    }

    const promotionalCode = await PromotionalCode.findOne({ where: { name } });

    if (!promotionalCode) {
      return NextResponse.json({ error: 'Cupom não encontrado' }, { status: 404 });
    }

    return NextResponse.json(promotionalCode, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar cupom', e: error }, { status: 500 });
  }
}

export const GET = authMiddleware(getByNameCode);


