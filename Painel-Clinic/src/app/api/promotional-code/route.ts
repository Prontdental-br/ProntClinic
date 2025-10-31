import { NextResponse } from 'next/server';


import authMiddleware from '../middleware/authMiddleware';
import { PromotionalCode } from '../db/models';

async function getCode() {
  try {
    const promotionalCodes = await PromotionalCode.findAll();

    return NextResponse.json(promotionalCodes);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar cupons', e: error }, { status: 500 });
  }
}

export const GET = authMiddleware(getCode);

 async function createCode(req: Request) {
  try {
    const { name, percentage, sellerId } = await req.json();

    if (!name || !percentage) {
      return NextResponse.json({ error: 'Nome e porcentagem são obrigatórios' }, { status: 400 });
    }

    const existingCode = await PromotionalCode.findOne({ where: { name } });

    if (existingCode) {
      return NextResponse.json({ error: 'Cupom já existe' }, { status: 409 });
    }

    const validityDate = new Date();

    validityDate.setMonth(validityDate.getMonth() + 6); // 6 months

    const newCode = await PromotionalCode.create({
      name: String(name),
      percentage: Number(percentage),
      sellerId: sellerId ? String(sellerId) : null,
      validity: validityDate
    } as PromotionalCode);

    return NextResponse.json(newCode, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao criar cupom' }, { status: 500 });
  }
}

export const POST = authMiddleware(createCode);


async function editCode(req: Request) {
  try {
    const { id, name, percentage, sellerId } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 });
    }

    const existingCode = await PromotionalCode.findByPk(id);

    if (!existingCode) {
      return NextResponse.json({ error: 'Cupom não encontrado' }, { status: 404 });
    }


    if (name && name !== existingCode.name) {
      const nameExists = await PromotionalCode.findOne({ where: { name } });

      if (nameExists) {
        return NextResponse.json({ error: 'Nome já está em uso' }, { status: 409 });
      }
    }

    await existingCode.update({ name, percentage, sellerId });

    return NextResponse.json(existingCode);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar cupom' }, { status: 500 });
  }
}

export const PATCH = authMiddleware(editCode);


