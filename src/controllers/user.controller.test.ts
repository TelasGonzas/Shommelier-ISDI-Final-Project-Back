import { NextFunction, Request, Response } from 'express';
import { UserController } from './user.controller';
import { UserRepo } from '../repository/user.repository';
import AuthServices from '../services/authentication';
import { HttpError } from '../types/http.error';
jest.mock('../services/authentication');
describe('Given the UserController class', () => {
  describe('When it is instantiated', () => {
    const mockRepo: UserRepo = {
      update: jest.fn(),
      search: jest.fn(),
      create: jest.fn(),
    } as unknown as UserRepo;
    const req = { body: {} } as unknown as Request;
    const res = { send: jest.fn(), status: jest.fn() } as unknown as Response;
    const next = jest.fn() as NextFunction;
    const controller = new UserController(mockRepo);
    test('Then the method register should be used ', async () => {
      req.body = {
        username: 'pepe',
        email: 'pepe@pepe.pepe',
        password: '1234',
      };
      await controller.register(req, res, next);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(mockRepo.create).toHaveBeenCalled();
    });
    test('Then the method login should be used', async () => {
      const mockUser = { user: 'Pepe', password: '1234' };
      req.body = mockUser;
      (AuthServices.compare as jest.Mock).mockResolvedValueOnce(true);
      await controller.login(req, res, next);
      expect(mockRepo.search).toHaveBeenCalled();
      expect(res.send).toHaveBeenCalled();
    });
  });
});
describe('Given a User controller', () => {
  const error = new Error('User or password invalid');
  const mockRepo = {
    query: jest.fn().mockRejectedValue(error),
    queryById: jest.fn().mockRejectedValue(error),
    update: jest.fn().mockRejectedValue(error),
    search: jest.fn().mockRejectedValue(error),
    create: jest.fn().mockRejectedValue(error),
    delete: jest.fn().mockRejectedValue(error),
    count: jest.fn().mockRejectedValue(error),
  } as UserRepo;
  const req = {
    params: { id: '1' },
    body: { id: '2', data: '' },
  } as unknown as Request;
  const res = { send: jest.fn() } as unknown as Response;
  const next = jest.fn() as NextFunction;
  const controller = new UserController(mockRepo);
  describe('When it is instantiated and post method is called without valid input', () => {
    test('Then next(error) should have been called', async () => {
      await controller.register(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });
  describe('When there is an instantiated error', () => {
    const error = new HttpError(400, 'Bad request', 'User or password invalid');
    const mockRepo = {
      update: jest.fn().mockRejectedValue(error),
      search: jest.fn().mockResolvedValue(error),
      create: jest.fn().mockResolvedValue(error),
    } as unknown as UserRepo;
    const req = {
      body: {},
    } as unknown as Request;
    const res = {
      send: jest.fn(),
    } as unknown as Response;
    const next = jest.fn() as NextFunction;
    const controller = new UserController(mockRepo);
    test('Then the login method should throw a HttpError if there is not an user or password', async () => {
      const error = new HttpError(
        400,
        'Bad request',
        'User or password invalid1'
      );
      await controller.login(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
    test('Then the login method should throw a HttpError for an invalid user', async () => {
      const mockUser = { user: 'Pepe', password: '123456' };
      req.body = mockUser;
      (mockRepo.search as jest.Mock).mockResolvedValueOnce([]);
      await controller.login(req, res, next);
      expect(next).toHaveBeenCalled();
    });
    test('Then the login method should throw a HttpError for an invalid password', async () => {
      const controller = new UserController(mockRepo);
      const mockUser = { userName: 'Pepe', password: '1234' };
      const mockInvalidUser = { user: 'Pepe', password: '12345' };
      req.body = mockInvalidUser;
      (mockRepo.search as jest.Mock).mockResolvedValueOnce([mockUser]);
      (AuthServices.compare as jest.Mock).mockResolvedValueOnce(false);
      await controller.login(req, res, next);
      expect(next).toHaveBeenCalled();
    });
    test('Then the login method should throw a HttpError for an invalid user or password', async () => {
      const controller = new UserController(mockRepo);
      const mockUser = { user: 'Pepe', password: '1234' };
      req.body = mockUser;
      (mockRepo.search as jest.Mock).mockResolvedValueOnce([mockUser]);
      (AuthServices.compare as jest.Mock).mockResolvedValueOnce(false);
      await controller.login(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });
  describe('When there is an instantiate of error', () => {
    const error = new Error('User or password invalid');
    const mockRepo = {
      post: jest.fn().mockRejectedValue(error),
    } as unknown as UserRepo;
    const req = {
      body: { password: '1234' },
    } as unknown as Request;
    const res = {
      send: jest.fn(),
      status: jest.fn(),
    } as unknown as Response;
    const controller = new UserController(mockRepo);
    const next = jest.fn() as NextFunction;
    test('Then the register method should throw an Error when the hash method from AuthServices does not work', async () => {
      (AuthServices.hash as jest.Mock).mockRejectedValueOnce(error);
      await controller.register(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
