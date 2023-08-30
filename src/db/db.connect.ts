import mongoose from 'mongoose';
import { password, user, name } from '../config.js';

export const dbConnect = () => {
  const uri = `mongodb+srv://${user}:${password}@cluster0.vf4tzas.mongodb.net/${name}?retryWrites=true&w=majority`;
  console.log(uri);
  return mongoose.connect(uri);
};
