import { Request, Response, NextFunction } from 'express';
import { HttpError } from '../types/http.error.js';
import mongoose, { mongo } from 'mongoose';

import createDebug from 'debug';
const debug = createDebug('W6:ErrorMiddleware');

export const errorHandler = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  debug('Executed');

  if (error instanceof HttpError) {
    console.log(error.status, error.statusMessage, error.message);
    res.status(error.status);
    res.statusMessage = error.message;
    res.send({
      status: error.status + ' ' + error.statusMessage,
    });
    return;
  }

  if (error instanceof mongoose.Error.ValidationError) {
    console.log(' Bad request', error.message);
    res.status(400);
    res.statusMessage = 'Bad Request';
    res.send({
      status: '400 Bad request',
    });
    return;
  }

  if (error instanceof mongo.MongoServerError) {
    console.log('406 Not accepted', error.message);
    res.status(406).send({
      status: '406 Not accepted',
      error: error.message,
    });
    return;
  }

  console.log(error);
  res.status(500);
  res.send({
    error: error.message,
  });
};
