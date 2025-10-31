import { NextResponse } from 'next/server'

import type { NextApiRequest } from 'next'

import adminUserRepository from '../repositories/adminUser.repository'
import authMiddleware from '../middleware/authMiddleware'

async function getRoute(req: NextApiRequest) {
  try {
    const home = await adminUserRepository.home();

    return NextResponse.json(home, { status: 200 })
  } catch (e) {
    console.log(e)
    
    return NextResponse.json(e)
  }
}


export const GET = authMiddleware(getRoute);