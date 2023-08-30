import { SneakerRepo } from '../repository/sneaker.repository.js';
import createDebug from 'debug';
import { NextFunction, Request, Response } from 'express';
import { UserRepo } from '../repository/user.repository.js';
import { HttpError } from '../types/http.error.js';
import { Controller } from './controller.js';
import { Sneaker } from '../entity/sneaker.entity.js';
import { PayloadToken } from '../services/authentication.js';
import { ApiResponse } from '../types/response.api.js';
const debug = createDebug('Final:SneakerController');

export class SneakerController extends Controller<Sneaker> {
  // eslint-disable-next-line no-unused-vars
  constructor(public repo: SneakerRepo, private userRepo: UserRepo) {
    super();
    debug('Instantiated');
  }

  async createSneaker(req: Request, res: Response, next: NextFunction) {
    try {
      const { sneakerModel, colorWay, year, status, image } = req.body;

      if (!sneakerModel || !colorWay || !year || !status || !image) {
        throw new HttpError(400, 'Bad request', 'Invalid params');
      }

      const { id: userId } = req.body.tokenPayload as PayloadToken;
      const user = await this.userRepo.queryById(userId);
      delete req.body.tokenPayload;
      req.body.owner = userId;
      const newSneaker = await this.repo.create(req.body);
      user.sneakers.push(newSneaker);
      this.userRepo.update(user.id, user);
      res.status(201);
      res.send(newSneaker);
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Number(req.query.page as string) || 1;
      const limit = 3;
      const status = req.query.status as string;

      let items: Sneaker[] = [];
      let next = null;
      let previous = null;
      let baseUrl = '';

      if (status) {
        items = await this.repo.query(page, limit, status);

        const totalCount = await this.repo.count(status);

        const totalPages = Math.ceil(totalCount / limit);

        baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}`;

        if (page < totalPages) {
          next = `${baseUrl}?status=${status}&page=${page + 1}`;
        }

        if (page > 1) {
          previous = `${baseUrl}?status=${status}&page=${page - 1}`;
        }

        const response: ApiResponse = {
          items,
          count: await this.repo.count(status),
          previous,
          next,
        };
        res.send(response);
      } else {
        items = await this.repo.query(page, limit);
        const totalCount = await this.repo.count();

        const totalPages = Math.ceil(totalCount / limit);

        baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}`;

        if (page < totalPages) {
          next = `${baseUrl}?page=${page + 1}`;
        }

        if (page > 1) {
          previous = `${baseUrl}?page=${page - 1}`;
        }

        const response: ApiResponse = {
          items,
          count: await this.repo.count(),
          previous,
          next,
        };
        res.send(response);
      }
    } catch (error) {
      next(error);
    }
  }

  async getRandomSneaker(_req: Request, res: Response, next: NextFunction) {
    try {
      const randomSneaker = await this.repo.getRandom();
      if (randomSneaker === null) {
        throw new HttpError(404, 'Not found', 'No sneakers available');
      }

      res.status(200).send(randomSneaker);
    } catch (error) {
      next(error);
    }
  }
}
