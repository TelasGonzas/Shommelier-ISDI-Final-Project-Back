import { Sneaker } from './sneaker.entity';

export type User = {
  id: string;
  username: string;
  email: string;
  password: string;
  sneakers: Sneaker[];
};
