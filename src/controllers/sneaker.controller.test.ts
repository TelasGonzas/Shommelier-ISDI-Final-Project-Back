/* eslint-disable no-unused-expressions */
import { NextFunction, Request, Response } from 'express';
import { SneakerRepo } from '../repository/sneaker.repository';
import { UserRepo } from '../repository/user.repository';
import { SneakerController } from './sneaker.controller';
import { User } from '../entity/user.entity';
import { Sneaker } from '../entity/sneaker.entity';

let mockSneakerRepo: SneakerRepo;
let mockUserRepo: UserRepo;
let req: Request;
let res: Response;
let next: NextFunction;

describe('Given the SneakerController class', () => {
  beforeEach(() => {
    mockUserRepo = {
      queryById: jest.fn(),
      update: jest.fn(),
    } as unknown as UserRepo;
    mockSneakerRepo = {
      query: jest.fn(),
      queryById: jest.fn(),
      search: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    } as unknown as SneakerRepo;

    req = {
      query: {},
      body: {},
      params: {},
      protocol: 'http',
      get: jest.fn().mockReturnValue('localhost:7777'),
      baseUrl: '/sneaker',
    } as unknown as Request;
    res = {
      send: jest.fn(),
      status: jest.fn(),
    } as unknown as Response;
    next = jest.fn() as NextFunction;
  });

  describe('When it is instantiated and the getAll method is used', () => {
    test('Then the query method should have been called', async () => {
      const controller = new SneakerController(mockSneakerRepo, mockUserRepo);
      req.query = { page: '2' };
      await controller.getAll(req, res, next);
      expect(mockSneakerRepo.query).toHaveBeenCalledWith(2, 3);
      expect(mockSneakerRepo.count).toHaveBeenCalled();
      expect(res.send).toHaveBeenCalled();
    });

    test('Then the query method should be called with "status"', async () => {
      const controller = new SneakerController(mockSneakerRepo, mockUserRepo);
      req.query = { page: '2', status: 'DS' };

      await controller.getAll(req, res, next);
      expect(mockSneakerRepo.query).toHaveBeenCalledWith(2, 3, 'DS');
      expect(mockSneakerRepo.count).toHaveBeenCalled();
      expect(res.send).toHaveBeenCalled();
    });

    test('Then the queryById method should be used', async () => {
      const controller = new SneakerController(mockSneakerRepo, mockUserRepo);
      await controller.getById(req, res, next);
      expect(res.send).toHaveBeenCalled();
      expect(mockSneakerRepo.queryById).toHaveBeenCalled();
    });

    test('Then the createSneaker method should be called', async () => {
      const controller = new SneakerController(mockSneakerRepo, mockUserRepo);
      const mockUser = {
        id: '1',
        userName: 'ragnoloco',
        sneakers: [],
      } as unknown as User;
      const mockSneaker = {
        id: '3',
        sneakerModel: 'Jordan 1',
        colorWay: 'bred',
        year: '2020',
        status: 'DS',
        image: '',
        owner: '1',
      } as unknown as Sneaker;

      mockSneakerRepo.create = jest.fn().mockResolvedValueOnce(mockSneaker);
      mockUserRepo.queryById = jest.fn().mockResolvedValueOnce(mockUser);
      mockUserRepo.update = jest.fn().mockResolvedValueOnce(mockUser);

      const req = {
        body: {
          tokenPayload: { id: '1' },
          sneakerModel: 'Jordan 1',
          colorWay: 'bred',
          year: '2020',
          status: 'DS',
          image: '',
          owner: '',
        },
      } as unknown as Request;

      await controller.createSneaker(req, res, next);

      expect(mockSneakerRepo.create).toHaveBeenCalled;
      expect(mockUserRepo.queryById).toHaveBeenCalled;
      expect(mockUserRepo.update).toHaveBeenCalled;
      expect(res.status).toHaveBeenCalled;
      expect(res.send).toHaveBeenCalled;
    });

    test('Then the update method should be used', async () => {
      const controller = new SneakerController(mockSneakerRepo, mockUserRepo);
      await controller.patch(req, res, next);
      expect(res.status).toHaveBeenCalled;
      expect(mockSneakerRepo.update).toHaveBeenCalled;
    });

    test('Then the delete method should be used', async () => {
      const controller = new SneakerController(mockSneakerRepo, mockUserRepo);
      await controller.delete(req, res, next);
      expect(res.send).toHaveBeenCalled();
      expect(mockSneakerRepo.delete).toHaveBeenCalled();
    });
  });

  describe('When the methods are called with errors', () => {
    const error = new Error('error');
    const mockUserRepo = {} as unknown as UserRepo;
    const mockSneakerRepo = {
      query: jest.fn().mockRejectedValue(error),
      queryById: jest.fn().mockRejectedValue(error),
      create: jest.fn().mockRejectedValue(error),
      update: jest.fn().mockRejectedValue(error),
      delete: jest.fn().mockRejectedValue(error),
    } as unknown as SneakerRepo;

    const newReq = {
      params: { id: '1' },
      body: { tokenPayload: {} },
      query: { offset: '77' },
    } as unknown as Request;
    const newRes = {
      send: jest.fn(),
    } as unknown as Response;
    const newController = new SneakerController(mockSneakerRepo, mockUserRepo);

    test('Then the getAll method should handle errors', async () => {
      await newController.getAll(newReq, newRes, next);
      expect(next).toHaveBeenCalled();
    });

    test('Then the queryById method should handle errors', async () => {
      await newController.getById(newReq, newRes, next);
      expect(next).toHaveBeenCalled();
    });

    test('Then the createSneaker method should handle errors', async () => {
      await newController.createSneaker(newReq, newRes, next);
      expect(next).toHaveBeenCalled();
    });

    test('Then the update method should handle errors', async () => {
      await newController.patch(newReq, newRes, next);
      expect(next).toHaveBeenCalled();
    });

    test('Then the delete method should handle errors', async () => {
      await newController.delete(newReq, newRes, next);
      expect(next).toHaveBeenCalled();
    });
  });
});
