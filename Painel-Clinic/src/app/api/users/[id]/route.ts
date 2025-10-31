import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server'

import type { NextApiRequest } from 'next'

import adminUserRepository from '../../repositories/adminUser.repository'
import authMiddleware from '../../middleware/authMiddleware'

async function getRoute(req: NextApiRequest) {

  try {
    let users: any = [];
    const id = (req.url?.split('/').at(-1)) || '';

    if(id)
      users = await adminUserRepository.getById(id);
    else users = await adminUserRepository.retrieveAll({});

    return NextResponse.json(users, { status: 200 })
  } catch (e) {
    console.log(e)
    
    return NextResponse.json(e)
  }
}

export const GET = authMiddleware(getRoute);

async function updateRoute(req: NextRequest) {

  try {
    const body = await req.json();
    const id = (req.url?.split('/').at(-1)) || '';

    await adminUserRepository.update(id, body);

    return NextResponse.json({mgs: 'OK'}, { status: 200 })
  } catch (e) {
    console.log(e)
    
    return NextResponse.json(e)
  }
}


export const PATCH = authMiddleware(updateRoute);


async function deleteRoute(req: NextApiRequest) {

  try {
    const id = (req.url?.split('/').at(-1)) || '';

    await adminUserRepository.delete(id);

    return NextResponse.json({mgs: 'OK'}, { status: 200 })
  } catch (e) {
    console.log(e)
    
    return NextResponse.json(e)
  }
}


export const DELETE = authMiddleware(deleteRoute);