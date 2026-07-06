import type { Response } from 'express';
import { Body, Controller, Delete, Get, Inject, Param, ParseIntPipe, Post, Res } from '@nestjs/common';
import { DeleteResult } from 'typeorm';
import { RequireRoles } from '../../../primary/decorators/auth/role.decorator';
import { Roles } from '../../../../common/enums/auth/roles.enum';
import { StockDTO, StockResponse } from '../../dto/stock/stock.model';
import { StockService } from '../../../../core/application/stock/stock.service';

@RequireRoles([Roles.ADMIN])
@Controller('stocks')
export class StockController {
  constructor(
    @Inject()
    private readonly stockService: StockService,
  ) { }

  @Post()
  async createResource(@Body() stock: StockDTO, @Res() res: Response) {
    await this.stockService.createStock(stock);
    return res.status(201).send({ message: 'Estoque atualizado com sucesso.' });
  }

  @Get()
  async listAllStocks(@Res() res: Response) {
    const arrStocks: StockResponse[] = await this.stockService.listStocks();
    return res.status(200).send(arrStocks);
  }

  @Get('/resource/:id')
  async listStockByResourceId(@Param('id', ParseIntPipe) resourceId: number, @Res() res: Response) {
    const stock: null | StockResponse = await this.stockService.listStockByResourceId(resourceId);
    if (!stock)
      return res.status(404).send({ message: 'Recurso não foi encontrado.' });

    return res.status(200).send(stock);
  }

  @Delete(':id')
  async deleteStock(@Param('id', ParseIntPipe) stockId: number, @Res() res: Response) {
    const deleted: DeleteResult = await this.stockService.deleteStock(stockId);
    if (deleted.affected === 0)
      return res.status(404).send({ message: 'Estoque não foi encontrado.' });

    return res.status(200).send({ message: 'Estoque deletado com sucesso.' });
  }
}
