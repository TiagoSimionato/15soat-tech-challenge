import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Stock } from '../../../modules/stock/entities/stock.entity';
import { StockDTO, StockResponse } from '../../../modules/stock/models/stock.model';
import { StockService } from '../../../modules/stock/services/stock.service';
import { stockResponseFormatter } from '../../../modules/stock/utils/stockResponse.helper';

jest.mock('../../../modules/stock/utils/stockResponse.helper', () => ({
  stockResponseFormatter: jest.fn(),
}));

const mockedFormatter = stockResponseFormatter as jest.MockedFunction<typeof stockResponseFormatter>;

const mockStockEntity: Stock = {
  amount: 10,
  id: 1,
  resource: { id: 1, name: 'Resource A' } as any,
  serviceItem: {} as any,
};

const mockStockResponse: StockResponse = {
  resource_id: 1,
  resource_name: 'Resource Name',
  resource_unit: 'Unit',
  stock_amount: 10,
  stock_id: 1,
};

const mockStockDTO: StockDTO = {
  amount: 10,
  resource_id: 1,
};

const mockRepository = () => ({
  delete: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  upsert: jest.fn(),
});

const mockEntityManager = () => {
  const mockRepo = {
    findOne: jest.fn() as jest.MockedFunction<any>,
  };
  const manager = {
    getRepository: jest.fn().mockReturnValue(mockRepo),
  };
  return { manager, mockRepo };
};

describe('StockService', () => {
  let service: StockService;
  let repository: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StockService,
        {
          provide: getRepositoryToken(Stock),
          useFactory: mockRepository,
        },
      ],
    }).compile();

    service = module.get<StockService>(StockService);
    repository = module.get(getRepositoryToken(Stock));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createStock', () => {
    it('should call upsert with correct payload', async () => {
      repository.upsert.mockResolvedValue(undefined);

      await service.createStock(mockStockDTO);

      expect(repository.upsert).toHaveBeenCalledTimes(1);
      expect(repository.upsert).toHaveBeenCalledWith(
        {
          amount: mockStockDTO.amount,
          resource: { id: mockStockDTO.resource_id },
        },
        ['resource.id'],
      );
    });

    it('should propagate errors thrown by upsert', async () => {
      repository.upsert.mockRejectedValue(new Error('DB error'));

      await expect(service.createStock(mockStockDTO)).rejects.toThrow('DB error');
    });
  });

  describe('listStocks', () => {
    it('should return a formatted list of stocks', async () => {
      repository.find.mockResolvedValue([mockStockEntity]);
      mockedFormatter.mockReturnValue(mockStockResponse);

      const result = await service.listStocks();

      expect(repository.find).toHaveBeenCalledWith({ relations: ['resource'] });
      expect(mockedFormatter).toHaveBeenCalledWith(mockStockEntity);
      expect(result).toEqual([mockStockResponse]);
    });

    it('should return an empty array when no stocks exist', async () => {
      repository.find.mockResolvedValue([]);

      const result = await service.listStocks();

      expect(result).toEqual([]);
      expect(mockedFormatter).not.toHaveBeenCalled();
    });

    it('should call formatter for each stock in the list', async () => {
      const secondEntity = { ...mockStockEntity, id: 2 };
      repository.find.mockResolvedValue([mockStockEntity, secondEntity]);
      mockedFormatter.mockReturnValue(mockStockResponse);

      await service.listStocks();

      expect(mockedFormatter).toHaveBeenCalledTimes(2);
      expect(mockedFormatter).toHaveBeenNthCalledWith(1, mockStockEntity);
      expect(mockedFormatter).toHaveBeenNthCalledWith(2, secondEntity);
    });

    it('should propagate errors thrown by find', async () => {
      repository.find.mockRejectedValue(new Error('DB error'));

      await expect(service.listStocks()).rejects.toThrow('DB error');
    });
  });

  describe('listStockByResourceId', () => {
    it('should return formatted stock when found using own repository', async () => {
      repository.findOne.mockResolvedValue(mockStockEntity);
      mockedFormatter.mockReturnValue(mockStockResponse);

      const result = await service.listStockByResourceId(1);

      expect(repository.findOne).toHaveBeenCalledWith({
        relations: ['resource'],
        where: { resource: { id: 1 } },
      });
      expect(mockedFormatter).toHaveBeenCalledWith(mockStockEntity);
      expect(result).toEqual(mockStockResponse);
    });

    it('should return null when stock is not found', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await service.listStockByResourceId(99);

      expect(result).toBeNull();
      expect(mockedFormatter).not.toHaveBeenCalled();
    });

    it('should use EntityManager repository when manager is provided', async () => {
      const { manager, mockRepo } = mockEntityManager();
      mockRepo.findOne.mockResolvedValue(mockStockEntity);
      mockedFormatter.mockReturnValue(mockStockResponse as never);

      const result = await service.listStockByResourceId(1, manager as any);

      expect(manager.getRepository).toHaveBeenCalledWith(Stock);
      expect(mockRepo.findOne).toHaveBeenCalledWith({
        relations: ['resource'],
        where: { resource: { id: 1 } },
      });
      expect(result).toEqual(mockStockResponse);
      expect(repository.findOne).not.toHaveBeenCalled();
    });

    it('should propagate errors thrown by findOne', async () => {
      repository.findOne.mockRejectedValue(new Error('DB error'));

      await expect(service.listStockByResourceId(1)).rejects.toThrow('DB error');
    });
  });

  describe('listStockByStockId', () => {
    it('should return formatted stock when found using own repository', async () => {
      repository.findOne.mockResolvedValue(mockStockEntity);
      mockedFormatter.mockReturnValue(mockStockResponse);

      const result = await service.listStockByStockId(1);

      expect(repository.findOne).toHaveBeenCalledWith({
        relations: ['resource'],
        where: { id: 1 },
      });
      expect(mockedFormatter).toHaveBeenCalledWith(mockStockEntity);
      expect(result).toEqual(mockStockResponse);
    });

    it('should return null when stock is not found', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await service.listStockByStockId(99);

      expect(result).toBeNull();
      expect(mockedFormatter).not.toHaveBeenCalled();
    });

    it('should use EntityManager repository when manager is provided', async () => {
      const { manager, mockRepo } = mockEntityManager();
      mockRepo.findOne.mockResolvedValue(mockStockEntity);
      mockedFormatter.mockReturnValue(mockStockResponse as never);

      const result = await service.listStockByStockId(1, manager as any);

      expect(manager.getRepository).toHaveBeenCalledWith(Stock);
      expect(mockRepo.findOne).toHaveBeenCalledWith({
        relations: ['resource'],
        where: { id: 1 },
      });
      expect(result).toEqual(mockStockResponse);
      expect(repository.findOne).not.toHaveBeenCalled();
    });

    it('should propagate errors thrown by findOne', async () => {
      repository.findOne.mockRejectedValue(new Error('DB error'));

      await expect(service.listStockByStockId(1)).rejects.toThrow('DB error');
    });
  });

  describe('deleteStock', () => {
    it('should delete a stock and return the DeleteResult', async () => {
      repository.delete.mockResolvedValue({ affected: 1, raw: {} });

      const result = await service.deleteStock(1);

      expect(repository.delete).toHaveBeenCalledWith({ id: 1 });
      expect(repository.delete).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ affected: 1, raw: {} });
    });

    it('should return affected: 0 when stock does not exist', async () => {
      repository.delete.mockResolvedValue({ affected: 0, raw: {} });

      const result = await service.deleteStock(99);

      expect(result).toEqual({ affected: 0, raw: {} });
    });

    it('should propagate errors thrown by delete', async () => {
      repository.delete.mockRejectedValue(new Error('DB error'));

      await expect(service.deleteStock(1)).rejects.toThrow('DB error');
    });
  });
});
