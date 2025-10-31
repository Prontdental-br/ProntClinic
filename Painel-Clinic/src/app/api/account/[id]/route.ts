import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server'

import accountRepository from '../../repositories/account.repository'
import authMiddleware from '../../middleware/authMiddleware'

async function getRoute(req: NextRequest) {

  try {
    let users: any = [];
    const id = (req.url?.split('/').at(-1)) || '';

    if(id)
      users = await accountRepository.getById(id);
    else users = await accountRepository.retrieveAll({});

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

    await accountRepository.update(id, body);

    return NextResponse.json({mgs: 'OK'}, { status: 200 })
  } catch (e) {
    console.log(e)
    
    return NextResponse.json(e)
  }
}


export const PATCH = authMiddleware(updateRoute);