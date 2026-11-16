import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ResourceResponse } from '../../frameworks/primary/dto/resources/resource.model';
import { StockResourceResponse } from '../../frameworks/primary/dto/stock/stock.model';
import { HttpClient } from './http.client';

@Injectable()
export class StockServiceClient extends HttpClient {
  protected serviceUrl: string = `${process.env.STOCK_SERVICE_URL}`;

  constructor(private readonly http: HttpService) { super(http); }

  async listResources() {
    try {
      const { data } = await super.get<ResourceResponse[]>('/resources');
      return data;
    }
    catch {
      throw new HttpException('Upstream service unavailable', HttpStatus.BAD_GATEWAY);
    }
  }

  async listStock() {
    try {
      const { data } = await super.get<StockResourceResponse[]>('/stocks');
      return data;
    }
    catch {
      throw new HttpException('Upstream service unavailable', HttpStatus.BAD_GATEWAY);
    }
  }

  async listStockByResourceId(id: number) {
    try {
      const { data } = await super.get<StockResourceResponse>(`/stocks/resource/${id}`);
      return data;
    }
    catch {
      throw new HttpException('Upstream service unavailable', HttpStatus.BAD_GATEWAY);
    }
  }

  async getStockByStockId(id: number) {
    try {
      const { data } = await super.get<StockResourceResponse>(`/stocks/${id}`);
      return data;
    }
    catch {
      throw new HttpException('Upstream service unavailable', HttpStatus.BAD_GATEWAY);
    }
  }

  async updateStock(id: number, amount: number) {
    try {
      await super.put(`/stocks/${id}`, { amount });
    }
    catch {
      throw new HttpException('Upstream service unavailable', HttpStatus.BAD_GATEWAY);
    }
  }
}
