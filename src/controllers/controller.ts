import { NextFunction, Request, Response } from 'express';
import { Repo } from '../repository/repo.js';
import { ApiResponse } from '../types/response.api.js';
import { HttpError } from '../types/http.error.js';

export abstract class Controller<T extends { id: string | number }> {
  public repo!: Repo<T>;

  async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const items = await this.repo.query();
      const response: Partial<ApiResponse> = {
        items,
        count: await this.repo.count(),
      };
      res.send(response);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      res.status(200);
      res.send(await this.repo.queryById(req.params.id));
    } catch (error) {
      next(error);
    }
  }

  async post(req: Request, res: Response, next: NextFunction) {
    try {
      res.status(201);
      res.send(await this.repo.create(req.body));
    } catch (error) {
      next(error);
    }
  }

  async patch(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.params.id) throw new HttpError(400, 'Bad Request');
      req.body.id = req.params.id;
      res.status(202);
      const newData = await this.repo.update(req.params.id, req.body);
      res.send(newData);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      res.status(204);
      res.send(await this.repo.delete(req.params.id));
    } catch (error) {
      next(error);
    }
  }
}
