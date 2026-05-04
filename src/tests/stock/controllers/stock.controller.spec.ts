import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { StockController } from '../../../modules/stock/controllers/stock.controller';
import { StockDTO, StockResponse } from '../../../modules/stock/models/stock.model';
import { StockService } from '../../../modules/stock/services/stock.service';

const mockStockDTO: StockDTO = {
  amount: 10,
  resource_id: 1,
};

const mockStockResponse: StockResponse = {
  resource_id: 1,
  resource_name: 'Resource Name',
  resource_unit: 'Unit',
  stock_amount: 10,
  stock_id: 1,
};

const mockStockArray: StockResponse[] = [mockStockResponse];

const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

const mockStockService = () => ({
  createStock: jest.fn(),
  deleteStock: jest.fn(),
  listStockByResourceId: jest.fn(),
  listStocks: jest.fn(),
});

describe('StockController', () => {
  let controller: StockController;
  let service: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StockController],
      providers: [
        {
          provide: StockService,
          useFactory: mockStockService,
        },
      ],
    }).compile();

    controller = module.get<StockController>(StockController);
    service = module.get(StockService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createResource', () => {
    it('should return 201 when stock is created successfully', async () => {
      service.createStock.mockResolvedValue(undefined);
      const res = mockResponse();

      await controller.createResource(mockStockDTO, res);

      expect(service.createStock).toHaveBeenCalledWith(mockStockDTO);
      expect(service.createStock).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.send).toHaveBeenCalledWith({ message: 'Estoque atualizado com sucesso.' });
    });

    it('should return 500 when service throws an error', async () => {
      const error = new Error('Unexpected error');
      service.createStock.mockRejectedValue(error);
      const res = mockResponse();

      await controller.createResource(mockStockDTO, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({ message: error });
    });
  });

  describe('listAllStocks', () => {
    it('should return 200 with all stocks', async () => {
      service.listStocks.mockResolvedValue(mockStockArray);
      const res = mockResponse();

      await controller.listAllStocks(res);

      expect(service.listStocks).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(mockStockArray);
    });

    it('should return 200 with empty array when no stocks exist', async () => {
      service.listStocks.mockResolvedValue([]);
      const res = mockResponse();

      await controller.listAllStocks(res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith([]);
    });

    it('should return 500 when service throws an error', async () => {
      const error = new Error('Unexpected error');
      service.listStocks.mockRejectedValue(error);
      const res = mockResponse();

      await controller.listAllStocks(res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({ message: error });
    });
  });

  describe('listStockByResourceId', () => {
    it('should return 200 with the stock when found', async () => {
      service.listStockByResourceId.mockResolvedValue(mockStockResponse);
      const res = mockResponse();

      await controller.listStockByResourceId(1, res);

      expect(service.listStockByResourceId).toHaveBeenCalledWith(1);
      expect(service.listStockByResourceId).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(mockStockResponse);
    });

    it('should return 404 when stock is not found', async () => {
      service.listStockByResourceId.mockResolvedValue(null);
      const res = mockResponse();

      await controller.listStockByResourceId(99, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith({ message: 'Recurso não foi encontrado.' });
    });

    it('should return 500 when service throws an error', async () => {
      const error = new Error('Unexpected error');
      service.listStockByResourceId.mockRejectedValue(error);
      const res = mockResponse();

      await controller.listStockByResourceId(1, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({ message: error });
    });
  });

  describe('deleteStock', () => {
    it('should return 200 when stock is deleted successfully', async () => {
      service.deleteStock.mockResolvedValue({ affected: 1, raw: {} });
      const res = mockResponse();

      await controller.deleteStock(1, res);

      expect(service.deleteStock).toHaveBeenCalledWith(1);
      expect(service.deleteStock).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({ message: 'Estoque deletado com sucesso.' });
    });

    it('should return 404 when no stock is affected', async () => {
      service.deleteStock.mockResolvedValue({ affected: 0, raw: {} });
      const res = mockResponse();

      await controller.deleteStock(99, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith({ message: 'Estoque não foi encontrado.' });
    });

    it('should return 500 when service throws an error', async () => {
      const error = new Error('Unexpected error');
      service.deleteStock.mockRejectedValue(error);
      const res = mockResponse();

      await controller.deleteStock(1, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({ message: error });
    });
  });
});
