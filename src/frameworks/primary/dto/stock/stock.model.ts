export type UpdateStock = {
  amount: number;
  resource_id: number;
};

export type StockResourceResponse = {
  resource_id: number;
  resource_name: string;
  resource_unit: string;
  stock_amount: number;
  stock_id: number;
};
