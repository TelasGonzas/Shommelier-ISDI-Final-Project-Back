import { NextFunction, Request, Response } from 'express';
import AuthServices, { PayloadToken } from '../services/authentication';
import { AuthInterceptor } from './auth.interceptor';
import { HttpError } from '../types/http.error';
import { SneakerRepo } from '../repository/sneaker.repository';

jest.mock('../services/authentication');

describe('Given an interceptor', () => {
  describe('When it is instantiated and logged method is called', () => {
    test('Then next should have been called', () => {
      const next = jest.fn() as NextFunction;
      const mockPayload = {} as PayloadToken;
      const req = { body: { tokenPayload: mockPayload } } as Request;
      const res = {} as Response;
      req.get = jest.fn().mockReturnValueOnce('Bearer valid token');
      const mockRepo: SneakerRepo = {} as unknown as SneakerRepo;
      const interceptor = new AuthInterceptor(mockRepo);
      (AuthServices.verifyJWT as jest.Mock).mockResolvedValueOnce(mockPayload);
      interceptor.logged(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('When it is instantiated and authorized method is called', () => {
    test('Then next should have been called', async () => {
      const next = jest.fn() as NextFunction;
      const mockPayload = { id: '1' } as PayloadToken;
      const req = {
        body: { tokenPayload: mockPayload },
        params: { id: '1' },
      } as unknown as Request;
      const res = {} as Response;
      const mockRepo: SneakerRepo = {
        queryById: jest.fn().mockResolvedValue({ owner: { id: '1' } }),
      } as unknown as SneakerRepo;
      const interceptor = new AuthInterceptor(mockRepo);
      interceptor.authorized(req, res, next);
      await expect(mockRepo.queryById).toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });
  });

  describe('When logged method is called but there is no authHeader', () => {
    test('Then it should throw an error', () => {
      const error = new HttpError(
        401,
        'Not Authorized',
        'Not Authorization header'
      );
      const next = jest.fn() as NextFunction;
      const mockPayload = {} as PayloadToken;
      const req = { body: { tokenPayload: mockPayload } } as Request;
      const res = {} as Response;
      req.get = jest.fn().mockReturnValueOnce(undefined);
      const mockRepo: SneakerRepo = {} as unknown as SneakerRepo;
      const interceptor = new AuthInterceptor(mockRepo);
      (AuthServices.verifyJWT as jest.Mock).mockResolvedValueOnce(mockPayload);
      interceptor.logged(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('When logged method is called but the authHeader does not start with Bearer', () => {
    test('Then it should throw an error', () => {
      const error = new HttpError(
        401,
        'Not Authorized',
        'Not Bearer in Authorization header'
      );
      const next = jest.fn() as NextFunction;
      const mockPayload = {} as PayloadToken;
      const req = { body: { tokenPayload: mockPayload } } as Request;
      const res = {} as Response;
      req.get = jest.fn().mockReturnValueOnce('Not valid token');
      const mockRepo: SneakerRepo = {} as unknown as SneakerRepo;
      const interceptor = new AuthInterceptor(mockRepo);
      (AuthServices.verifyJWT as jest.Mock).mockResolvedValueOnce(mockPayload);
      interceptor.logged(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('When authorized method is called but there is no tokenPayload in the request body', () => {
    test('Then it should throw an error', () => {
      const error = new HttpError(
        498,
        'Token not found',
        'Token not found in Authorized interceptor'
      );
      const next = jest.fn() as NextFunction;
      const req = {
        body: { tokenPayload: undefined },
        params: { id: '1' },
      } as unknown as Request;
      const res = {} as Response;
      const mockRepo: SneakerRepo = {} as unknown as SneakerRepo;
      const interceptor = new AuthInterceptor(mockRepo);
      interceptor.authorized(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('When authorized method is called but the body id is different from the params id', () => {
    const mockSneakerRepo = {
      queryById: jest.fn().mockResolvedValue({ owner: { id: '6' } }),
    } as unknown as SneakerRepo;

    const res = {} as unknown as Response;
    const next = jest.fn() as NextFunction;
    const authInterceptor = new AuthInterceptor(mockSneakerRepo);

    test('Then it should throw an error', async () => {
      const error = new HttpError(401, 'Not authorized', 'Not authorized');
      const mockUserID = { id: '0' };
      const mockSneakerID = { id: '1', owner: { id: '2' } };
      const req = {
        body: { tokenPayload: mockUserID },
        params: mockSneakerID,
      } as unknown as Request;

      authInterceptor.authorized(req, res, next);
      await expect(mockSneakerRepo.queryById).toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
