import type { Response } from 'express';
import { Body, Controller, Inject, Post, Res } from '@nestjs/common';
import { ServiceItemDTO } from '../models/serviceItem.model';
import { ServiceOrderService } from '../services/serviceOrder.service';

@Controller('services/item')
export class ServiceOrderController {
  constructor(
    @Inject()
    private serviceOrderService: ServiceOrderService,
  ) { }

  @Post()
  async createService(@Body() item: ServiceItemDTO, @Res() res: Response) {
    try {
      await this.serviceOrderService.createServiceOrder(order);
      return res.status(201).send({ message: 'Ordem de serviço criada com sucesso.' });
    }
    catch (error) {
      return res.status(500).send({ message: error });
    }
  }
}
