import type { Response } from 'express';
import { Body, Controller, Delete, Get, Inject, Param, Post, Put, Res } from '@nestjs/common';
import { RequireRoles } from 'src/modules/auth/decorators/role.decorator';
import { Roles } from 'src/modules/auth/enums/roles.enum';
import { UpdateResult } from 'typeorm';
import { DeleteResult } from 'typeorm/browser';
import { Resource } from '../entities/resources.entity';
import { ResourcesByService } from '../entities/resourcesByService.entity';
import { ResourceDTO } from '../models/resource.model';
import { ResourceByServiceDTO } from '../models/resourceByService.model';
import { ResourceService } from '../services/resources.service';

@RequireRoles([Roles.ADMIN])
@Controller('resources')
export class ResourcesController {
  constructor(
    @Inject()
    private readonly resourceService: ResourceService,
  ) { }

  @Post()
  async createResource(@Body() resource: ResourceDTO, @Res() res: Response) {
    try {
      await this.resourceService.createResource(resource);
      return res.status(201).send({ message: 'Recurso criado com sucesso.' });
    }
    catch (error) {
      return res.status(500).send({ message: error });
    }
  }

  @Post('/:resourceId/service/:serviceId')
  async createResourceForService(@Param() resourceId, @Param() serviceId, @Body() resourceQuantity: ResourceByServiceDTO, @Res() res: Response) {
    try {
      await this.resourceService.createResourceForService(serviceId.serviceId, resourceId.resourceId, resourceQuantity.min_quantity);
      return res.status(201).send({ message: 'Recurso vínculado ao serviço com sucesso.' });
    }
    catch (error) {
      return res.status(500).send({ message: error });
    }
  }

  @Get()
  async listAllResources(@Res() res: Response) {
    try {
      const arrResources: Resource[] = await this.resourceService.listResources();
      return res.status(200).send(arrResources);
    }
    catch (error) {
      return res.status(500).send({ message: error });
    }
  }

  @Get('/service/:id')
  async listResourcesOfAService(@Param() serviceId, @Res() res: Response) {
    try {
      const resources: null | ResourcesByService[] = await this.resourceService.listResourcesOfAService(serviceId.id);
      if (!resources)
        return res.status(404).send({ message: 'Recursos não foram encontrados para o serviço solicitado.' });

      return res.status(200).send(resources);
    }
    catch (error) {
      return res.status(500).send({ message: error });
    }
  }

  @Get(':id')
  async listOneResource(@Param() resourceId, @Res() res: Response) {
    try {
      const resource: null | Resource = await this.resourceService.listOneResource(resourceId.id);
      if (!resource)
        return res.status(404).send({ message: 'Recurso não foi encontrado.' });

      return res.status(200).send(resource);
    }
    catch (error) {
      return res.status(500).send({ message: error });
    }
  }

  @Put(':id')
  async updateResource(@Param() resourceId, @Body() resource: ResourceDTO, @Res() res: Response) {
    try {
      const update: UpdateResult = await this.resourceService.updateResource(resourceId.id, resource);
      if (update.affected === 0)
        return res.status(404).send({ message: 'Recurso não foi encontrado.' });

      res.status(201).send({ message: 'Recurso atualizado com sucesso.' });
    }
    catch (error) {
      return res.status(500).send({ message: error });
    }
  }

  @Put('service/:id')
  async updateResourceQuantityOfAService(@Param() resourceServiceId, @Body() resourceQuantity: ResourceByServiceDTO, @Res() res: Response) {
    try {
      const update: UpdateResult = await this.resourceService.updateResourceQuantityOfAService(resourceServiceId.id, resourceQuantity.min_quantity);
      if (update.affected === 0)
        return res.status(404).send({ message: 'Recursos não foram encontrados para o serviço solicitado.' });

      res.status(201).send({ message: 'Quantidade de recurso atualizada com sucesso.' });
    }
    catch (error) {
      return res.status(500).send({ message: error });
    }
  }

  @Delete(':id')
  async deleteResource(@Param() resourceId, @Res() res: Response) {
    try {
      const deleted: DeleteResult = await this.resourceService.deleteResource(resourceId.id);
      if (deleted.affected === 0)
        return res.status(404).send({ message: 'Recurso não foi encontrado.' });

      return res.status(200).send({ message: 'Recurso deletado com sucesso.' });
    }
    catch (error) {
      return res.status(500).send({ message: error });
    }
  }

  @Delete('/service/:id')
  async deleteResourceOfAService(@Param() resourceServiceId, @Res() res: Response) {
    try {
      const deleted: DeleteResult = await this.resourceService.deleteResourceOfAService(resourceServiceId.id);
      if (deleted.affected === 0)
        return res.status(404).send({ message: 'Recursos não foram encontrados para o serviço solicitado.' });

      return res.status(200).send({ message: 'Recurso do serviço deletado com sucesso.' });
    }
    catch (error) {
      return res.status(500).send({ message: error });
    }
  }
}
