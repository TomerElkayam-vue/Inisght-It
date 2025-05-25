import {
  HttpException,
  HttpStatus,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { AuthenticatedUser } from '../projects/project.controller';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (req.originalUrl.includes('callback')) {
      console.log('Skip');
    } else {
      const token = req.headers.authorization?.split(' ')[1]; // Extract token from Authorization header
      if (token) {
        try {
          if (!process.env.JWT_SECRET) {
            throw new HttpException(
              'JWT secret is not defined',
              HttpStatus.INTERNAL_SERVER_ERROR
            );
          }
          const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify token
          if (typeof decoded === 'object' && decoded !== null) {
            req.user = decoded as AuthenticatedUser; // Attach user info to the request object
          } else {
            throw new HttpException(
              'Unauthorized - Invalid token payload',
              HttpStatus.UNAUTHORIZED
            );
          }
        } catch (err) {
          throw new HttpException(
            'Unauthorized - Invalid token',
            HttpStatus.UNAUTHORIZED
          );
        }
      } else {
        throw new HttpException(
          'Unauthorized - No token provided',
          HttpStatus.UNAUTHORIZED
        );
      }
    }
    next();
  }
}
