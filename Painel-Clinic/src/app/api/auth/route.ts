import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server'

import * as argon2 from 'argon2';
import type { NextApiRequest } from 'next'

import jwt from 'jsonwebtoken';

import adminUserRepository from '../repositories/adminUser.repository'
import { AdminUser } from '../db/models'


export async function GET(req: NextRequest) {
  try {
    const users = await adminUserRepository.retrieveAll({})

    return NextResponse.json(users, { status: 200 })
  } catch (e) {
    console.log(e)

    return NextResponse.json(e)
  }
}

export async function POST(req: Request) {
    const body = await req.json();
    const { username, password } = body;

    const user = await AdminUser.findOne({where: { email: username }, raw: true });

    if (!user) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const passwordMatches = await argon2.verify(user.password, password);

    console.log('passwordMatches',passwordMatches)

    if (!passwordMatches) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }

    const token = jwt.sign({ id: user.id, username: user.email, role: user.role }, 'your_jwt_secret', {
      expiresIn: '24h',
    });

    return NextResponse.json({ token, user: { id: user.id, email: user.email, role: user.role, name: user.name } }, { status: 200 });
}
