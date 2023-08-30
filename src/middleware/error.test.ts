import mongoose, { mongo } from 'mongoose';
import { errorHandler } from '../middleware/error.js';
import { HttpError } from '../types/http.error.js';
import { Request, Response, NextFunction } from 'express';

describe('Given errorHandler middleware', () => {
  const req = {} as Request;
  const res = {
    status: jest.fn().mockReturnThis(),
    send: jest.fn(),
  } as unknown as Response;
  const next = jest.fn() as NextFunction;

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('When called with an HttpError, should set status, statusMessage, and send an error object', () => {
    const error = new HttpError(
      404,
      ' Not Found',
      'The requested resource was not found'
    );

    errorHandler(error, req, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith({
      status: `${error.status} ${error.statusMessage}`,
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('When called with a non-HttpError, should set status to 500 and send an error object', () => {
    const error = new Error('An unknown error occurred');

    errorHandler(error, req, res, next);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      error: 'An unknown error occurred',
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('When called with ValidationError, should set status to 400 and call next', () => {
    const error = new mongoose.Error.ValidationError();

    errorHandler(error, req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  test('When called with MongoServerError, should set status to 406 and send an error object', () => {
    const error = new mongo.MongoServerError({});

    errorHandler(error, req, res, next);
    expect(res.status).toHaveBeenCalledWith(406);
    expect(res.send).toHaveBeenCalledWith({
      status: '406 Not accepted',
      error: error.message,
    });
    expect(next).not.toHaveBeenCalled();
  });
});
