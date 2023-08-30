import path from 'path';
import multer from 'multer';
import createDebug from 'debug';
import crypto from 'crypto';
import { NextFunction, Request, Response } from 'express';
import { HttpError } from '../types/http.error.js';
import { FireBase } from '../services/firebase.js';
import sharp from 'sharp';
const debug = createDebug('Final:FileMiddleware');

const optionsSets: {
  [key: string]: {
    width: number;
    height: number;
    fit: keyof sharp.FitEnum;
    position: string;
    quality: number;
  };
} = {
  sneaker: {
    width: 550,
    height: 300,
    fit: 'inside',
    position: 'top',
    quality: 100,
  },
};

export class FileMiddleware {
  constructor() {
    debug('Instantiate');
  }

  singleFileStore(fileName = 'file', fileSize = 8_000_000) {
    const upload = multer({
      storage: multer.diskStorage({
        destination: 'public/uploads',
        filename(_req, file, callback) {
          const suffix = crypto.randomUUID();
          const extension = path.extname(file.originalname);
          const basename = path.basename(file.originalname, extension);
          const filename = `${basename}-${suffix}${extension}`;
          debug('Called Multer');
          callback(null, filename);
        },
      }),
      limits: {
        fileSize,
      },
    });
    const middleware = upload.single(fileName);
    return (req: Request, res: Response, next: NextFunction) => {
      const previousBody = req.body;
      middleware(req, res, next);
      req.body = { ...previousBody, ...req.body };
    };
  }

  async optimization(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new HttpError(406, 'Not Acceptable', 'Not valid image file');
      }

      const options = optionsSets.sneaker;
      const fileName = req.file.filename;
      const baseFileName = `${path.basename(fileName, path.extname(fileName))}`;

      const imageData = await sharp(path.join('public/uploads', fileName))
        .resize(options.width, options.height, {
          fit: options.fit,
          position: options.position,
        })
        .webp({ quality: options.quality })
        .toFormat('webp')
        .toFile(path.join('public/uploads', `${baseFileName}_1.webp`));

      req.file.originalname = req.file.path;
      req.file.filename = `${baseFileName}.${imageData.format}`;
      req.file.mimetype = `image/${imageData.format}`;
      req.file.path = path.join('public/uploads', req.file.filename);
      req.file.size = imageData.size;

      next();
    } catch (error) {
      next(error);
    }
  }

  saveImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      debug('Called saveImage', req.file);
      if (!req.file)
        throw new HttpError(406, 'Not Acceptable', 'Not valid image file');

      const aUserImage = req.file.filename.split('.');
      const userImage = aUserImage[0] + '_1.' + aUserImage[1];

      const firebase = new FireBase();
      const backUpImage = await firebase.uploadFile(userImage);

      req.body[req.file.fieldname] = {
        urlOriginal: req.file.originalname,
        url: backUpImage,
        mimetype: req.file.mimetype,
        size: req.file.size,
      };
      next();
    } catch (error) {
      next(error);
    }
  };
}
