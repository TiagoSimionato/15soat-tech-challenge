import { StockResponse } from '../frameworks/primary/dto/stock/stock.model';
import { Stock } from '../frameworks/secondary/stock/stock.entity';

export const stockResponseFormatter = (stock: Stock): StockResponse => ({
  resource_id: stock.resource.id,
  resource_name: stock.resource.name,
  resource_unit: stock.resource.unit,
  stock_amount: stock.amount,
  stock_id: stock.id,
});
