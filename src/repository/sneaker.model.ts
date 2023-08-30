import { Schema, model } from 'mongoose';
import { Sneaker } from '../entity/sneaker.entity';

const sneakerSchema = new Schema<Sneaker>({
  sneakerModel: {
    type: String,
    required: true,
  },
  colorWay: {
    type: String,
    required: true,
  },
  designer: {
    type: String,
  },
  year: {
    type: String,
    required: true,
  },
  status: {
    type: String,
  },
  retail: {
    type: String,
  },
  SKU: {
    type: String,
  },
  description: {
    type: String,
  },
  image: {
    type: {
      urlOriginal: { type: String },
      url: { type: String },
      mimetype: { type: String },
      size: { type: Number },
    },
    required: true,
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
});

sneakerSchema.set('toJSON', {
  transform(_document, returnedObject) {
    returnedObject.id = returnedObject._id;
    delete returnedObject.__v;
    delete returnedObject._id;
    delete returnedObject.passwd;
  },
});

export const SneakerModel = model('Sneaker', sneakerSchema, 'sneakers');
