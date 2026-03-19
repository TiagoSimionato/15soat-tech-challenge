import { Stock } from '../entities/stock.entity';
import { StockResponse } from '../models/stock.model';

export const stockResponseFormatter = (stock: Stock): StockResponse => ({
  resource_id: stock.resource.id,
  resource_name: stock.resource.name,
  resource_unit: stock.resource.unit,
  stock_amount: stock.amount,
  stock_id: stock.id,
});
