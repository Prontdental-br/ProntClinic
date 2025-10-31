import { NextResponse } from "next/server";

import whatsappRepository from "@/app/api/repositories/whatsapp.repository";
import evolutionApi from "../../evolutionApi";

async function restartConnection(req: Request) {
  const { pathname } = new URL(req.url || '')
  const id = (pathname.split('/').at(-1)) || '';
  const instance = await whatsappRepository.findByPk(id);

  if (instance === null)
    return NextResponse.json({ message: 'conexão não encontrada'}, { status: 404 });

  await evolutionApi.put(
    '/instance/restart/' + instance.evolutionInstanceName,
  );

  return NextResponse.json({ message: 'success'}, { status: 200 });
}


export const GET = restartConnection
