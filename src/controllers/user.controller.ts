import { UserRepo } from '../repository/user.repository.js';
import createDebug from 'debug';
import { NextFunction, Request, Response } from 'express';
import AuthServices, { PayloadToken } from '../services/authentication.js';
import { HttpError } from '../types/http.error.js';
import { LoginResponse } from '../types/response.api.js';
import { Controller } from './controller.js';
import { User } from '../entity/user.entity.js';
const debug = createDebug('Final:UserController');

export class UserController extends Controller<User> {
  // eslint-disable-next-line no-unused-vars
  constructor(public repo: UserRepo) {
    super();
    debug('Instantiated');
  }

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.body.username || !req.body.email || !req.body.password) {
        throw new HttpError(400, 'Bad request1', 'User or password invalid');
      }

      const password = await AuthServices.hash(req.body.password);
      req.body.password = password;
      res.status(201);
      res.send(await this.repo.create(req.body));
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.body.user || !req.body.password) {
        throw new HttpError(400, 'Bad request1.5', 'User or password invalid1');
      }

      let data = await this.repo.search({
        key: 'username',
        value: req.body.user,
      });
      if (!data.length) {
        data = await this.repo.search({
          key: 'email',
          value: req.body.user,
        });
      }

      if (!data.length) {
        throw new HttpError(400, 'Bad request2', 'User or password invalid2');
      }

      const isUserValid = await AuthServices.compare(
        req.body.password,
        data[0].password
      );

      if (!isUserValid) {
        throw new HttpError(400, 'Bad request3', 'User or password invalid3');
      }

      const payload: PayloadToken = {
        id: data[0].id,
        username: data[0].username,
      };
      const token = AuthServices.createJWT(payload);
      const response: LoginResponse = {
        token,
        user: data[0],
      };
      res.send(response);
    } catch (error) {
      next(error);
    }
  }
}
