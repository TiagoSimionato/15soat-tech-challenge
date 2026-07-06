import type { Response } from 'express';
import { Body, Controller, Delete, Get, Inject, Param, ParseIntPipe, Post, Put, Res } from '@nestjs/common';
import { UpdateResult } from 'typeorm';
import { DeleteResult } from 'typeorm/browser';
import { RequireRoles } from '../../decorators/auth/role.decorator';
import { Roles } from '../../../../common/enums/auth/roles.enum';
import { Services } from '../../../secondary/services/services.entity';
import { ServicesDTO } from '../../dto/services/services.model';
import { ServicesService } from '../../../../core/application/services/services.service';

@Controller('services')
export class ServicesController {
  constructor(
    @Inject()
    private readonly servicesService: ServicesService,
  ) { }

  @RequireRoles([Roles.ADMIN])
  @Post()
  async createService(@Body() services: ServicesDTO, @Res() res: Response) {
    await this.servicesService.createService(services);
    return res.status(201).send({ message: 'Serviço criado com sucesso.' });
  }

  @Get()
  async listAllServices(@Res() res: Response) {
    const arrServicess: Services[] = await this.servicesService.listServices();
    return res.status(200).send(arrServicess);
  }

  @Get('/:id')
  async listOneService(@Param('id', ParseIntPipe) serviceId: number, @Res() res: Response) {
    const services: null | Services = await this.servicesService.listOneService(serviceId);
    if (!services)
      return res.status(404).send({ message: 'Serviço não foi encontrado.' });

    return res.status(200).send(services);
  }

  @RequireRoles([Roles.ADMIN])
  @Put('/:id')
  async updateService(@Param('id', ParseIntPipe) servicesId: number, @Body() services: ServicesDTO, @Res() res: Response) {
    const update: UpdateResult = await this.servicesService.updateService(servicesId, services);
    if (update.affected === 0)
      return res.status(404).send({ message: 'Serviço não foi encontrado.' });

    res.status(201).send({ message: 'Serviço atualizado com sucesso.' });
  }

  @RequireRoles([Roles.ADMIN])
  @Delete('/:id')
  async deleteService(@Param('id', ParseIntPipe) servicesId: number, @Res() res: Response) {
    const deleted: DeleteResult = await this.servicesService.deleteService(servicesId);
    if (deleted.affected === 0)
      return res.status(404).send({ message: 'Serviço não foi encontrado.' });

    return res.status(200).send({ message: 'Serviço deletado com sucesso.' });
  }
}
