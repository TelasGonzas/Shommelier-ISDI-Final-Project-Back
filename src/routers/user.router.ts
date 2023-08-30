import { Router as createRouter } from 'express';
import { UserRepo } from '../repository/user.repository.js';
import { UserController } from '../controllers/user.controller.js';

const repo: UserRepo = new UserRepo();
const controller = new UserController(repo);

export const userRouter = createRouter();

userRouter.patch('/login', controller.login.bind(controller));
userRouter.post('/register', controller.register.bind(controller));
