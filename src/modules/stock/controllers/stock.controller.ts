import type { Response } from 'express';
import { Body, Controller, Delete, Get, Inject, Param, ParseIntPipe, Post, Res } from '@nestjs/common';
import { DeleteResult } from 'typeorm';
import { RequireRoles } from '../../auth/decorators/role.decorator';
import { Roles } from '../../auth/enums/roles.enum';
import { StockDTO, StockResponse } from '../models/stock.model';
import { StockService } from '../services/stock.service';

@RequireRoles([Roles.ADMIN])
@Controller('stocks')
export class StockController {
  constructor(
    @Inject()
    private readonly stockService: StockService,
  ) { }

  @Post()
  async createResource(@Body() stock: StockDTO, @Res() res: Response) {
    try {
      await this.stockService.createStock(stock);
      return res.status(201).send({ message: 'Estoque atualizado com sucesso.' });
    }
    catch (error) {
      return res.status(500).send({ message: error });
    }
  }

  @Get()
  async listAllStocks(@Res() res: Response) {
    try {
      const arrStocks: StockResponse[] = await this.stockService.listStocks();
      return res.status(200).send(arrStocks);
    }
    catch (error) {
      return res.status(500).send({ message: error });
    }
  }

  @Get('/resource/:id')
  async listStockByResourceId(@Param('id', ParseIntPipe) resourceId: number, @Res() res: Response) {
    try {
      const stock: null | StockResponse = await this.stockService.listStockByResourceId(resourceId);
      if (!stock)
        return res.status(404).send({ message: 'Recurso não foi encontrado.' });

      return res.status(200).send(stock);
    }
    catch (error) {
      return res.status(500).send({ message: error });
    }
  }

  @Delete(':id')
  async deleteStock(@Param('id', ParseIntPipe) stockId: number, @Res() res: Response) {
    try {
      const deleted: DeleteResult = await this.stockService.deleteStock(stockId);
      if (deleted.affected === 0)
        return res.status(404).send({ message: 'Estoque não foi encontrado.' });

      return res.status(200).send({ message: 'Estoque deletado com sucesso.' });
    }
    catch (error) {
      return res.status(500).send({ message: error });
    }
  }
}
