import { User } from './user.entity';
import { Image } from '../types/image';

export type Sneaker = {
  id: string;
  owner: User;
  sneakerModel: string;
  colorWay: string;
  designer: string;
  year: string;
  status: 'DSWT' | 'DS' | 'VNDS' | 'USED';
  retail: string;
  SKU: string;
  image: Image;
  description: string;
};
