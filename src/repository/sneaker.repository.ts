import { Sneaker } from '../entity/sneaker.entity.js';
import { Repo } from './repo.js';
import createDebug from 'debug';
import { SneakerModel } from './sneaker.model.js';
import { HttpError } from '../types/http.error.js';
const debug = createDebug('Quiet:SneakerRepo ');

export class SneakerRepo implements Repo<Sneaker> {
  constructor() {
    debug('Instantiated', SneakerModel);
  }

  async query(page = 1, limit = 3, status?: string): Promise<Sneaker[]> {
    page = Number(page as any);
    limit = Number(limit as any);
    const queryObj = {} as any;

    if (status) {
      queryObj.status = status;
    }

    return SneakerModel.find(queryObj)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('owner')
      .exec();
  }

  async count(status?: string): Promise<number> {
    const queryObj = {} as any;

    if (status) {
      queryObj.status = status;
    }

    return SneakerModel.countDocuments(queryObj).exec();
  }

  async queryById(id: string): Promise<Sneaker> {
    const result = await SneakerModel.findById(id)
      .populate('owner', { sneakers: 0 })
      .exec();
    if (result === null)
      throw new HttpError(400, 'Not found', 'No user found with this id');
    return result;
  }

  async create(data: Omit<Sneaker, 'id'>): Promise<Sneaker> {
    const newSneaker = await SneakerModel.create(data);
    return newSneaker;
  }

  async update(id: string, data: Partial<Sneaker>): Promise<Sneaker> {
    const newSneaker = await SneakerModel.findByIdAndUpdate(id, data, {
      new: true,
    })
      .populate('owner', { sneakers: 0 })
      .exec();

    if (newSneaker === null)
      throw new HttpError(404, 'Not found', 'Invalid id');
    return newSneaker;
  }

  async search({
    key,
    value,
  }: {
    key: string;
    value: unknown;
  }): Promise<Sneaker[]> {
    const result = await SneakerModel.find({ [key]: value }).exec();
    return result;
  }

  async delete(id: string): Promise<void> {
    const result = await SneakerModel.findByIdAndDelete(id).exec();
    if (result === null) throw new HttpError(404, 'Not found', 'Invalid id');
  }

  async getRandom(): Promise<Sneaker | null> {
    const count = await this.count();
    if (count === 0) {
      return null;
    }

    const randomIndex = Math.floor(Math.random() * count);
    const randomSneaker = await SneakerModel.findOne().skip(randomIndex).exec();
    return randomSneaker || null;
  }
}
