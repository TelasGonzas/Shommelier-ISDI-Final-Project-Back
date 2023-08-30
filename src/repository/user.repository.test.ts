import { User } from '../entity/user.entity';
import { HttpError } from '../types/http.error';
import { UserModel } from './user.model';
import { UserRepo } from './user.repository';

jest.mock('./user.model.js');

describe('Given UserRepo Class', () => {
  describe('When I instantiate it', () => {
    const repo = new UserRepo();

    test('Then method create should be used', async () => {
      const mockUser = {} as User;
      UserModel.create = jest.fn().mockReturnValueOnce(mockUser);
      const result = await repo.create({} as Omit<User, 'id'>);
      expect(UserModel.create).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    test('Then method search should be used', async () => {
      const mockUser = { key: 'username', value: 'pepe' };
      const mockResult = [{ username: 'pepe', password: '1234' }];
      const exec = jest.fn().mockResolvedValue(mockResult);
      UserModel.find = jest.fn().mockReturnValueOnce({ exec });

      const result = await repo.search(mockUser);

      expect(UserModel.find).toHaveBeenCalledWith({
        [mockUser.key]: mockUser.value,
      });
      expect(result).toEqual(mockResult);
    });

    test('Then method update should be used', async () => {
      const mockId = '12345';
      const mockData = { username: 'pepe', password: 'newPassword' };
      const mockUpdatedUser = { _id: mockId, ...mockData };
      const exec = jest.fn().mockResolvedValue(mockUpdatedUser);
      UserModel.findByIdAndUpdate = jest.fn().mockReturnValueOnce({ exec });

      const result = await repo.update(mockId, mockData);

      expect(UserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockId,
        mockData,
        { new: true }
      );
      expect(result).toEqual(mockUpdatedUser);
    });

    test('When update fails due to wrong id, should throw HttpError', async () => {
      const mockId = '12345';
      const mockData = { username: 'pepe', password: 'newPassword' };
      const exec = jest.fn().mockResolvedValue(null);
      UserModel.findByIdAndUpdate = jest.fn().mockReturnValueOnce({ exec });

      try {
        await repo.update(mockId, mockData);
        expect(true).toBe(false);
      } catch (error: any) {
        expect(error).toBeInstanceOf(HttpError);
        expect(error.status).toBe(404);
        expect(error.statusMessage).toBe('Not found');
        expect(error.message).toBe('Wrong id to update');
      }
    });
    test('Then the count method should be used', async () => {
      const mockNumber = 7;
      const exec = jest.fn().mockResolvedValueOnce(mockNumber);
      UserModel.countDocuments = jest.fn().mockReturnValue({
        exec,
      });

      const result = await repo.count();
      expect(UserModel.countDocuments).toHaveBeenCalled();
      expect(exec).toHaveBeenCalled();
      expect(result).toBe(mockNumber);
    });
  });
});

describe('Given UserRepo Class', () => {
  describe('When I instantiate it', () => {
    const repo = new UserRepo();

    test('Then method query should return an array of users', async () => {
      const mockData = [{ username: 'pepe', password: '1234' }];
      UserModel.find = jest
        .fn()
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(mockData) });

      const result = await repo.query();

      expect(UserModel.find).toHaveBeenCalled();
      expect(result).toEqual(mockData);
    });

    test('Then method queryById should return a user', async () => {
      const mockId = '12345';
      const mockResult = { username: 'pepe', password: '1234' };
      UserModel.findById = jest
        .fn()
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(mockResult) });

      const result = await repo.queryById(mockId);

      expect(UserModel.findById).toHaveBeenCalledWith(mockId);
      expect(result).toEqual(mockResult);
    });

    test('When queryById fails due to bad id, should throw HttpError', async () => {
      const mockId = '12345';
      UserModel.findById = jest
        .fn()
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(null) });

      try {
        await repo.queryById(mockId);
        expect(true).toBe(false);
      } catch (error: any) {
        expect(error).toBeInstanceOf(HttpError);
        expect(error.status).toBe(404);
        expect(error.statusMessage).toBe('Not found');
        expect(error.message).toBe('Bad id for the query');
      }
    });

    test('Then method delete should be used', async () => {
      const mockId = '12345';
      const mockResult = { _id: mockId };
      UserModel.findByIdAndDelete = jest
        .fn()
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(mockResult) });

      await repo.delete(mockId);

      expect(UserModel.findByIdAndDelete).toHaveBeenCalledWith(mockId);
    });

    test('Then method delete should throw errors', async () => {
      const mockId = '12345';
      const exec = jest.fn().mockResolvedValue(null);
      UserModel.findByIdAndDelete = jest.fn().mockReturnValueOnce({ exec });

      try {
        await repo.delete(mockId);
        expect(UserModel.findByIdAndDelete).toHaveBeenCalledWith(mockId);
      } catch (error: any) {
        expect(error).toBeInstanceOf(HttpError);
        expect(error.status).toBe(404);
        expect(error.statusMessage).toBe('Not found');
        expect(error.message).toBe('Bad id for the delete');
      }
    });
  });
});
