import { Request, Response } from 'express';
import { FileMiddleware } from './files';
import { HttpError } from '../types/http.error';
import multer from 'multer';
import sharp from 'sharp';

type MockMulter = jest.Mock & { diskStorage: jest.Mock };
type MockSharp = jest.Mock & { [key: string]: jest.Mock };

jest.mock('multer', () => {
  const multer: MockMulter = jest.fn().mockImplementation(() => ({
    single: jest.fn(),
  })) as MockMulter;

  multer.diskStorage = jest
    .fn()
    .mockImplementation(
      (options: {
        destination: '';
        filename: (_req: object, _file: object, _cb: () => void) => void;
      }) => {
        options.filename({}, { originalname: '' }, () => null);
      }
    );
  return multer;
});

jest.mock('sharp', () => {
  const sharp: MockSharp = jest.fn() as MockSharp;
  sharp.mockReturnValue(sharp);
  sharp.resize = jest.fn().mockReturnValue(sharp);
  sharp.webp = jest.fn().mockReturnValue(sharp);
  sharp.toFormat = jest.fn().mockReturnValue(sharp);
  sharp.toFile = jest.fn().mockReturnValue(sharp);
  return sharp;
});

describe('Given FilesMiddleware', () => {
  describe('When method singleFileStore is used', () => {
    test('Then it should ...', () => {
      const filesMiddleware = new FileMiddleware();
      filesMiddleware.singleFileStore();
      expect(multer).toHaveBeenCalled();
      expect(multer.diskStorage).toHaveBeenCalled();
    });
  });

  describe('When method optimization is used with the data of a file', () => {
    const req = {
      path: '/register',
      body: {},
      file: { filename: 'test' },
    } as Request;
    const resp = {} as unknown as Response;
    const next = jest.fn();

    test('should be call sharp and next without parameters', async () => {
      const filesMiddleware = new FileMiddleware();
      await filesMiddleware.optimization(req, resp, next);

      expect(sharp).toHaveBeenCalled();
      expect(next).toHaveBeenLastCalledWith();
    });
  });

  describe('When method optimization is used without data of a file', () => {
    const req = {
      path: '/register',
    } as Request;
    const resp = {} as unknown as Response;
    const next = jest.fn();
    test('Then it should call next with the error', async () => {
      const filesMiddleware = new FileMiddleware();
      filesMiddleware.optimization(req, resp, next);
      expect(next).toHaveBeenLastCalledWith(expect.any(HttpError));
    });
  });

  describe('When method saveImage is used with valid data', () => {
    const req: unknown = {
      body: {},
      file: { filename: 'test' },
      get: jest.fn(),
    };
    const resp = {} as unknown as Response;
    const next = jest.fn();

    test('Then it should call next without parameters', async () => {
      const filesMiddleware = new FileMiddleware();
      await filesMiddleware.saveImage(req as Request, resp, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('When method saveImage is used with NOT valid data', () => {
    const req = {} as Request;
    const resp = {} as unknown as Response;
    const next = jest.fn();

    test('Then it should call next with the error', () => {
      const filesMiddleware = new FileMiddleware();
      filesMiddleware.saveImage(req, resp, next);
      expect(next).toHaveBeenLastCalledWith(expect.any(HttpError));
    });
  });
});
