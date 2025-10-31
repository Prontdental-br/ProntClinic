import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server'

import type { NextApiRequest } from 'next'

import adminUserRepository from '../repositories/adminUser.repository'
import authMiddleware from '../middleware/authMiddleware'

async function getRoute(req: NextApiRequest) {
  try {
    const { searchParams } = new URL(req.url || '');
    const role = searchParams.get('role') || '';
    const users = await adminUserRepository.retrieveAll(role ? { role } : {})

    return NextResponse.json(users, { status: 200 })
  } catch (e) {
    console.log(e)
    
    return NextResponse.json(e)
  }
}


export const GET = authMiddleware(getRoute);

async function postHandler(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const users = await adminUserRepository.save(body);

    return NextResponse.json(users, { status: 200 })
  } catch (e) {
    console.log(e)

    return NextResponse.json(e)
  }
}

export const POST = authMiddleware(postHandler);