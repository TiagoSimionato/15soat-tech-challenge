import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, EntityManager, Repository } from 'typeorm';
import { StockDTO, StockResponse } from '../../../frameworks/primary/dto/stock/stock.model';
import { Stock } from '../../../frameworks/secondary/stock/stock.entity';
import { stockResponseFormatter } from '../../../utils/stockResponse.helper';

@Injectable()
export class StockService {
  constructor(
    @InjectRepository(Stock)
    private readonly stockRepository: Repository<Stock>,
  ) { }

  async createStock(stock: StockDTO) {
    await this.stockRepository.upsert({
      amount: stock.amount,
      resource: {
        id: stock.resource_id,
      },
    }, ['resource.id']);
  }

  async listStocks(): Promise<StockResponse[]> {
    const arrStock = await this.stockRepository.find({ relations: ['resource'] });
    const formattedStock: StockResponse[] = [];

    for (const i in arrStock) {
      formattedStock.push(stockResponseFormatter(arrStock[i]));
    }
    return formattedStock;
  }

  async listStockByResourceId(resourceId: number, manager?: EntityManager): Promise<null | StockResponse> {
    const repo = manager ? manager.getRepository(Stock) : this.stockRepository;

    const stock: null | Stock = await repo.findOne({
      relations: ['resource'],
      where: {
        resource: {
          id: resourceId,
        },
      },
    });

    return stock ? stockResponseFormatter(stock) : null;
  }

  async listStockByStockId(id: number, manager?: EntityManager): Promise<null | StockResponse> {
    const repo = manager ? manager.getRepository(Stock) : this.stockRepository;
    const stock: null | Stock = await repo.findOne({
      relations: ['resource'],
      where: {
        id,
      },
    });

    return stock ? stockResponseFormatter(stock) : null;
  }

  async deleteStock(stockId: number): Promise<DeleteResult> {
    return await this.stockRepository.delete({ id: stockId });
  }
}
