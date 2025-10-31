import { randomUUID } from 'crypto';

import { NextResponse } from 'next/server'

import whatsappRepository from '../repositories/whatsapp.repository'
import type { CreateEvolutionInstanceReturn } from './interfaces';
import evolutionApi from './evolutionApi';

async function findAll(req: Request) {
  const data = await whatsappRepository.findAllCreatedByAdmin();
  
  return NextResponse.json({ data }, { status: 200 })
}

async function createInstanceInEvolution() {
  try {
    const { data }: { data: CreateEvolutionInstanceReturn } =
    await evolutionApi.post('/instance/create', {
      instanceName: randomUUID().toString(),
      qrcode: true,
      integration: 'WHATSAPP-BAILEYS',
      webhook: {
        enabled: true,
        url: process.env.EVOLUTION_WEBHOOK_URL || 'https://api.prontdental.cloud/whatsapp/evolution-webhook',
        events: ['CONNECTION_UPDATE'],
      },
    });

    return data;
  } catch (error) {
    console.error(error);
    throw new Error();
  }
}

async function createConnection(req: Request) {
  try {
    const data = await createInstanceInEvolution();
  
    await whatsappRepository.create({
      token: data.hash,
      evolutionInstanceId: data.instance.instanceId,
      isConnected: false,
      evolutionInstanceName: data.instance.instanceName,
      createdByAdmin: true,
    });

    return NextResponse.json({ qrCode: data.qrcode.base64}, { status: 200 })

  } catch (error) {
    console.error(error);

    return NextResponse.json({ message: 'Internal Server Error'}, { status: 500 })
  }
}


export const GET = findAll
export const POST = createConnection