import { hash, compare } from 'bcrypt';
import jwt from 'jsonwebtoken';
import { secret } from '../config.js';
import { HttpError } from '../types/http.error.js';

export type PayloadToken = {
  id: string;
  username: string;
} & jwt.JwtPayload;

export default class AuthServices {
  private static salt = 10;

  static createJWT(payload: PayloadToken) {
    const token = jwt.sign(payload, secret!);
    return token;
  }

  static verifyJWT(token: string) {
    try {
      const result = jwt.verify(token, secret!);
      if (typeof result === 'string') {
        throw new HttpError(498, 'Invalid Token1', result);
      }

      return result as PayloadToken;
    } catch (error) {
      throw new HttpError(498, 'Invalid Token2', (error as Error).message);
    }
  }

  static hash(value: string) {
    return hash(value, AuthServices.salt);
  }

  static compare(value: string, hash: string) {
    return compare(value, hash);
  }
}
