import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { Stock } from './entities/stock.entity';
import { StockDTO, StockResponse } from './models/stock.model';
import { stockResponseFormatter } from './utils/stockResponse.helper';

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

  async listStockByResourceId(resourceId: number): Promise<null | StockResponse> {
    const stock: null | Stock = await this.stockRepository.findOne({
      relations: ['resource'],
      where: {
        resource: {
          id: resourceId,
        },
      },
    });

    return stock ? stockResponseFormatter(stock) : null;
  }

  async deleteStock(stockId: number): Promise<DeleteResult> {
    return await this.stockRepository.delete({ id: stockId });
  }
}
