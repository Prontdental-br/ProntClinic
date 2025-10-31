// utils/authMiddleware.js
import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server'

import jwt from 'jsonwebtoken';

// eslint-disable-next-line @typescript-eslint/ban-types
const authMiddlewareV2 = (handler: Function) => {
  return async (req: any) => {
    const token = req.headers.get('authorization')?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ error: 'Token not provided' }, {status: 401});
    }

    try {
      const decoded = jwt.verify(token, process.env.PRONTDENTAL_JWT_SECRET || '');

      req['user'] = decoded;
      
      return handler(req);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, {status: 401});
    }
  };
};

export default authMiddlewareV2;
