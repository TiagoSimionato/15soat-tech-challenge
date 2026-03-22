import type { Response } from 'express';
import { Body, Controller, Delete, Get, Inject, Param, Post, Put, Res } from '@nestjs/common';
import { RequireRoles } from 'src/modules/auth/decorators/role.decorator';
import { Roles } from 'src/modules/auth/enums/roles.enum';
import { UpdateResult } from 'typeorm';
import { DeleteResult } from 'typeorm/browser';
import { Services } from '../entities/services.entity';
import { ServicesDTO } from '../models/services.model';
import { ServicesService } from '../services/services.service';

@Controller('services')
export class ServicesController {
  constructor(
    @Inject()
    private servicesService: ServicesService,
  ) { }

  @RequireRoles([Roles.ADMIN])
  @Post('/create')
  async createService(@Body() services: ServicesDTO, @Res() res: Response) {
    try {
      await this.servicesService.createService(services);
      return res.status(201).send({ message: 'Serviço criado com sucesso.' });
    }
    catch (error) {
      return res.status(500).send({ message: error });
    }
  }

  @Get('/list')
  async listAllServices(@Res() res: Response) {
    try {
      const arrServicess: Services[] = await this.servicesService.listServices();
      return res.status(200).send(arrServicess);
    }
    catch (error) {
      return res.status(500).send({ message: error });
    }
  }

  @Get('/list/:id')
  async listOneService(@Param() serviceId, @Res() res: Response) {
    try {
      const services: null | Services = await this.servicesService.listOneService(serviceId.id);
      if (!services)
        return res.status(404).send({ message: 'Serviço não foi encontrado.' });

      return res.status(200).send(services);
    }
    catch (error) {
      return res.status(500).send({ message: error });
    }
  }

  @RequireRoles([Roles.ADMIN])
  @Put('/update/:id')
  async updateService(@Param() servicesId, @Body() services: ServicesDTO, @Res() res: Response) {
    try {
      const update: UpdateResult = await this.servicesService.updateService(servicesId.id, services);
      if (update.affected === 0)
        return res.status(404).send({ message: 'Serviço não foi encontrado.' });

      res.status(201).send({ message: 'Serviço atualizado com sucesso.' });
    }
    catch (error) {
      return res.status(500).send({ message: error });
    }
  }

  @RequireRoles([Roles.ADMIN])
  @Delete('/remove/:id')
  async deleteService(@Param() servicesId, @Res() res: Response) {
    try {
      const deleted: DeleteResult = await this.servicesService.deleteService(servicesId.id);
      if (deleted.affected === 0)
        return res.status(404).send({ message: 'Serviço não foi encontrado.' });

      return res.status(200).send({ message: 'Serviço deletado com sucesso.' });
    }
    catch (error) {
      return res.status(500).send({ message: error });
    }
  }
}
