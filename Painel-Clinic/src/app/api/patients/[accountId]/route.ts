import { NextResponse } from 'next/server'

import type { NextApiRequest } from 'next'

import patientRepository from '../../repositories/patient.repository'
import authMiddleware from '../../middleware/authMiddleware'

async function getRoute(req: NextApiRequest) {
  try {
    const { searchParams, pathname } = new URL(req.url || '')
    const accountId = (pathname.split('/').at(-1)) || '';
    const page = searchParams.get('page') ? Number(searchParams.get('page')) : 1;
    const data = await patientRepository.retrieveByAccountId(accountId, page);

    return NextResponse.json(data, { status: 200 })
  } catch (e) {
    return NextResponse.json(e)
  }
}


export const GET = authMiddleware(getRoute);
