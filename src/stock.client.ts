import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { HttpClient } from './httpClient';

@Injectable()
export class StockClient extends HttpClient {
  protected serviceUrl: string = process.env.STOCK_SERVICE_URL ?? '';

  constructor(private readonly http: HttpService) { super(http); }

  async getStock(sku: string) {
    try {
      const { data } = await super.get(`/stock/${sku}`);
      return data;
    }
    catch {
      throw new HttpException('Upstream service unavailable', HttpStatus.BAD_GATEWAY);
    }
  }
}
