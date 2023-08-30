import { Router as createRouter } from 'express';
import { SneakerRepo } from '../repository/sneaker.repository.js';
import { SneakerController } from '../controllers/sneaker.controller.js';
import { UserRepo } from '../repository/user.repository.js';
import { AuthInterceptor } from '../middleware/auth.interceptor.js';
import { FileMiddleware } from '../middleware/files.js';

const sneakerRepo: SneakerRepo = new SneakerRepo();
const userRepo: UserRepo = new UserRepo();
const controller = new SneakerController(sneakerRepo, userRepo);

const auth = new AuthInterceptor(sneakerRepo);
const fileStore = new FileMiddleware();
export const sneakerRouter = createRouter();

sneakerRouter.get('/random', controller.getRandomSneaker.bind(controller));
sneakerRouter.get('/', controller.getAll.bind(controller));
sneakerRouter.get('/:id', controller.getById.bind(controller));
sneakerRouter.post(
  '/',
  auth.logged.bind(auth),
  fileStore.singleFileStore('image').bind(fileStore),
  fileStore.optimization.bind(fileStore),
  fileStore.saveImage.bind(fileStore),
  controller.createSneaker.bind(controller)
);
sneakerRouter.patch(
  '/:id',
  auth.logged.bind(auth),
  auth.authorized.bind(auth),
  controller.patch.bind(controller)
);
sneakerRouter.delete(
  '/:id',
  auth.logged.bind(auth),
  auth.authorized.bind(auth),
  controller.delete.bind(controller)
);
