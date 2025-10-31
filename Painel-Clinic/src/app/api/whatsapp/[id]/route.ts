import { NextResponse } from "next/server";

import whatsappRepository from "../../repositories/whatsapp.repository";
import evolutionApi from "../evolutionApi";

async function deleteConnection(req: Request) {
  try {
    const { pathname } = new URL(req.url || '');
    const id = pathname.split('/').at(-1) || '';

    if (!id) {
      return NextResponse.json({ message: 'ID inválido' }, { status: 400 });
    }

    const instance = await whatsappRepository.findByPk(id);

    if (!instance) {
      return NextResponse.json({ message: 'Conexão não encontrada' }, { status: 404 });
    }

    try {

      await evolutionApi.delete(
        '/instance/logout/' + instance.evolutionInstanceName,
      );
      
      await evolutionApi.delete(`/instance/delete/${instance.evolutionInstanceName}`);
    } catch (error: any) {
   
      if (error.response?.status === 404) {
        console.warn(
          `Conexão ${instance.evolutionInstanceName} não encontrada na Evolution API, continuando a exclusão local.`
        );
      } else {
    
        console.error(`Erro ao excluir conexão na Evolution API:`, error.response?.data || error.message);

        return NextResponse.json(
          { message: 'Erro ao tentar excluir a conexão na Evolution API' },
          { status: 500 }
        );
      }
    }


    await instance.destroy();

    return NextResponse.json({ message: 'Conexão excluída com sucesso' }, { status: 200 });
  } catch (error: any) {
    console.error(`Erro ao excluir conexão:`, error.message || error);

    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 });
  }
}


export const DELETE = deleteConnection;

