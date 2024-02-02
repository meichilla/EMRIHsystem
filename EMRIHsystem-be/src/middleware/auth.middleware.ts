import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private readonly secretKey: string = process.env.SECRET_KEY;
  use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: 'Authorization header missing' });
    }

    console.log('authHeader', authHeader);
    const [bearer, token] = authHeader.split(' ');
    console.log('token', token);

    if (bearer !== 'Bearer') {
      return res
        .status(401)
        .json({ message: 'Invalid authorization header format' });
    }

    try {
      const decoded = jwt.verify(token, this.secretKey);
      req['user'] = decoded;
      console.log('user', decoded);

      next();
    } catch (error) {
      return res.status(401).json({ message: 'Invalid token' });
    }
  }
}
