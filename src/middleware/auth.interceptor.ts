/* eslint-disable no-useless-constructor */
import { NextFunction, Request, Response } from 'express';
import { HttpError } from '../types/http.error.js';
import AuthServices, { PayloadToken } from '../services/authentication.js';
import { SneakerRepo } from '../repository/sneaker.repository.js';

export class AuthInterceptor {
  // eslint-disable-next-line no-unused-vars
  constructor(protected repo: SneakerRepo) {}

  logged(req: Request, res: Response, next: NextFunction) {
    try {
      const authHeader = req.get('Authorization');
      if (!authHeader) {
        throw new HttpError(401, 'Not Authorized', 'Not Authorization header');
      }

      if (!authHeader.startsWith('Bearer')) {
        throw new HttpError(
          401,
          'Not Authorized',
          'Not Bearer in Authorization header'
        );
      }

      const token = authHeader.slice(6);
      const payload = AuthServices.verifyJWT(token);

      req.body.tokenPayload = payload;
      next();
    } catch (error) {
      next(error);
    }
  }

  async authorized(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.body.tokenPayload) {
        throw new HttpError(
          498,
          'Token not found',
          'Token not found in Authorized interceptor'
        );
      }

      const { id: userId } = req.body.tokenPayload as PayloadToken;
      const { id: sneakerId } = req.params;

      console.log(userId, sneakerId);

      const sneaker = await this.repo.queryById(sneakerId);
      console.log(req.params, userId);
      if (sneaker.owner.id !== userId) {
        throw new HttpError(401, 'Not authorized', 'Not authorized');
      }

      next();
    } catch (error) {
      next(error);
    }
  }
}
