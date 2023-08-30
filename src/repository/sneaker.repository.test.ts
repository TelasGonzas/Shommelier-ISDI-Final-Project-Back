import { Sneaker } from '../entity/sneaker.entity.js';
import { User } from '../entity/user.entity.js';
import { HttpError } from '../types/http.error.js';
import { SneakerModel } from './sneaker.model.js';
import { SneakerRepo } from './sneaker.repository.js';
import { Image } from '../types/image.js';

jest.mock('./sneaker.model');

describe('Given the SneakerRepo class', () => {
  const repo = new SneakerRepo();
  describe('When it has been instantiated', () => {
    test('Then the query method should be used', async () => {
      const mockData = [{}];
      const exec = jest.fn().mockResolvedValueOnce(mockData);

      SneakerModel.find = jest.fn().mockReturnValueOnce({
        skip: jest.fn().mockReturnValueOnce({
          limit: jest.fn().mockReturnValueOnce({
            populate: jest.fn().mockReturnValueOnce({
              exec,
            }),
          }),
        }),
      });

      const result = await repo.query();
      expect(SneakerModel.find).toHaveBeenCalled();
      expect(exec).toHaveBeenCalled();
      expect(result).toEqual(mockData);
    });

    test('Then the queryById method should be used', async () => {
      const mockSample = { id: '1' };
      const exec = jest.fn().mockResolvedValue(mockSample);
      SneakerModel.findById = jest.fn().mockReturnValueOnce({
        populate: jest.fn().mockReturnValue({
          exec,
        }),
      });

      const result = await repo.queryById('1');
      expect(exec).toHaveBeenCalled();
      expect(result).toEqual(mockSample);
    });

    test('Then the create method should be used', async () => {
      const mockSneaker = {
        title: 'test',
        year: 1234,
        region: 'Asia',
        description: 'qwertyuiop',
        image: {} as Image,
        owner: {} as User,
      } as unknown as Sneaker;

      SneakerModel.create = jest.fn().mockReturnValueOnce(mockSneaker);
      const result = await repo.create(mockSneaker);
      expect(SneakerModel.create).toHaveBeenCalled();
      expect(result).toEqual(mockSneaker);
    });

    test('Then the update method should be used', async () => {
      const mockId = '1';
      const mockSneaker = { id: '1', title: 'test' };
      const updatedSneaker = { id: '1', title: 'test2' };
      const exec = jest.fn().mockResolvedValueOnce(updatedSneaker);
      SneakerModel.findByIdAndUpdate = jest.fn().mockReturnValueOnce({
        populate: jest.fn().mockReturnValue({
          exec,
        }),
      });
      const result = await repo.update(mockId, mockSneaker);
      expect(SneakerModel.findByIdAndUpdate).toHaveBeenCalled();
      expect(result).toEqual(updatedSneaker);
    });

    test('Then the search method should be used', async () => {
      const mockSneakers = [{ id: '1', title: 'test' }];

      const exec = jest.fn().mockResolvedValueOnce(mockSneakers);
      SneakerModel.find = jest.fn().mockReturnValueOnce({
        exec,
      });
      const result = await repo.search({ key: 'title', value: 'test' });
      expect(SneakerModel.find).toHaveBeenCalled();
      expect(result).toEqual(mockSneakers);
    });

    test('Then the delete method should be used', async () => {
      const mockId = '1';
      const exec = jest.fn();
      SneakerModel.findByIdAndDelete = jest.fn().mockReturnValueOnce({
        exec,
      });
      await repo.delete(mockId);
      expect(SneakerModel.findByIdAndDelete).toHaveBeenCalled();
    });
  });

  describe('When it is instantiated and queryById method is called but the id is not found', () => {
    test('Then it should throw an error', async () => {
      const repo = new SneakerRepo();
      const error = new HttpError(
        404,
        'Not found',
        'No user found with this id'
      );
      const mockId = '1';

      const exec = jest.fn().mockResolvedValue(null);

      SneakerModel.findById = jest.fn().mockReturnValueOnce({
        populate: jest.fn().mockReturnValueOnce({
          exec,
        }),
      });

      await expect(repo.queryById(mockId)).rejects.toThrowError(error);
      expect(SneakerModel.findById).toHaveBeenCalled();
    });
  });

  describe('When it is instantiated and update method is called but the new user equals to null', () => {
    test('Then it should throw an error', async () => {
      const repo = new SneakerRepo();
      const error = new HttpError(404, 'Not found', 'Invalid id');
      const mockId = '1';
      const mockSneaker = {} as Partial<Sneaker>;

      const exec = jest.fn().mockResolvedValue(null);
      SneakerModel.findByIdAndUpdate = jest.fn().mockReturnValueOnce({
        populate: jest.fn().mockReturnValue({
          exec,
        }),
      });

      await expect(repo.update(mockId, mockSneaker)).rejects.toThrowError(
        error
      );
      expect(SneakerModel.findByIdAndUpdate).toHaveBeenCalled();
    });
  });

  describe('When it is instantiated and delete method is called but the id is not found', () => {
    test('Then it should throw an error', async () => {
      const repo = new SneakerRepo();
      const error = new HttpError(404, 'Not found', 'Invalid id');
      const mockId = '1';
      const exec = jest.fn().mockResolvedValueOnce(null);
      SneakerModel.findByIdAndDelete = jest.fn().mockReturnValueOnce({
        exec,
      });
      await expect(repo.delete(mockId)).rejects.toThrowError(error);
      expect(SneakerModel.findByIdAndDelete).toHaveBeenCalled();
    });
  });

  test('Then the count method should be used', async () => {
    const mockStatus = 'DS';

    const queryObj = {} as any;
    const exec = jest.fn().mockResolvedValueOnce(3);

    SneakerModel.countDocuments = jest.fn().mockReturnValue(queryObj);
    queryObj.exec = exec;

    const result = await repo.count(mockStatus);

    expect(exec).toHaveBeenCalled();
    expect(result).toBe(3);
  });
  describe('When the query method is used', () => {
    test('Then it should return all the sneakers with "DS" status', async () => {
      const mockStatus = 'DS';

      const queryObj = {} as any;
      const skip = jest.fn().mockReturnThis();
      const limit = jest.fn().mockReturnThis();
      const populate = jest.fn().mockReturnThis();
      const exec = jest.fn().mockResolvedValueOnce([]);

      SneakerModel.find = jest.fn().mockReturnValue(queryObj);
      queryObj.skip = skip;
      queryObj.limit = limit;
      queryObj.populate = populate;
      queryObj.exec = exec;

      await repo.query(1, 6, mockStatus);

      expect(skip).toHaveBeenCalled();
      expect(limit).toHaveBeenCalled();
      expect(populate).toHaveBeenCalledWith('owner');
      expect(exec).toHaveBeenCalled();
    });
  });
});
