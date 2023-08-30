import { hash, compare } from 'bcrypt';
import AuthServices, { PayloadToken } from './authentication';
import jwt from 'jsonwebtoken';
import { HttpError } from '../types/http.error';

jest.mock('jsonwebtoken');
jest.mock('bcrypt');

describe('Given AuthServices class', () => {
  describe('When use createJWT', () => {
    test('Then JWT should be called', () => {
      const payload = {} as PayloadToken;
      AuthServices.createJWT(payload);
      expect(jwt.sign).toHaveBeenCalled();
    });
  });
  describe('When I use verifJWTGettingPayload method', () => {
    test('verifyJWTGettingPayload should be called', () => {
      const mockToken = 'token';
      AuthServices.verifyJWT(mockToken);
      expect(jwt.verify).toHaveBeenCalled();
    });
  });

  test('When the result of the jwt.verify function returns a string and gives an error', () => {
    const mockResult = 'test';
    const mockToken = 'token';
    const error = new HttpError(498, 'Invalid Token', mockResult);
    const mockVerify = (jwt.verify as jest.Mock).mockReturnValueOnce(
      mockResult
    );
    expect(() => AuthServices.verifyJWT(mockToken)).toThrow(error);
    expect(mockVerify).toHaveBeenCalled();
  });

  test('When use hash method', async () => {
    const mockValue = 'password';
    const mockHashedValue = 'hashedPassword';
    (hash as jest.Mock).mockResolvedValueOnce(mockHashedValue);

    const result = await AuthServices.hash(mockValue);

    expect(hash).toHaveBeenCalled();
    expect(result).toBe(mockHashedValue);
  });

  test('When use compare method', async () => {
    const mockValue = 'password';
    const mockHashedValue = 'hashedPassword';
    (compare as jest.Mock).mockResolvedValueOnce(true);

    const result = await AuthServices.compare(mockValue, mockHashedValue);

    expect(compare).toHaveBeenCalled();
    expect(result).toBe(true);
  });
});
