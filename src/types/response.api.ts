import { User } from '../entity/user.entity';

export type ApiResponse = {
  count: number;
  items: { [key: string]: any }[];
  next: string | null;
  previous: string | null;
};

export type LoginResponse = {
  token: string;
  user: User;
};
