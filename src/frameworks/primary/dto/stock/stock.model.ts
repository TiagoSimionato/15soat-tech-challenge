import { IsInt } from 'class-validator';

export class StockDTO {
  @IsInt() amount: number;
  @IsInt() resource_id: number;
}

export class StockResponse {
  stock_id: number;
  resource_name: string;
  resource_id: number;
  stock_amount: number;
  resource_unit: string;
}
