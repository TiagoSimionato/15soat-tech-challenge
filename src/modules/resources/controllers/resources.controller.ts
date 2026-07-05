import type { Response } from 'express';
import { Body, Controller, Delete, Get, Inject, Param, ParseIntPipe, Post, Put, Res } from '@nestjs/common';
import { UpdateResult } from 'typeorm';
import { DeleteResult } from 'typeorm/browser';
import { RequireRoles } from '../../auth/decorators/role.decorator';
import { Roles } from '../../auth/enums/roles.enum';
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
    await this.resourceService.createResource(resource);
    return res.status(201).send({ message: 'Recurso criado com sucesso.' });
  }

  @Post('/:resourceId/service/:serviceId')
  async createResourceForService(
    @Param('resourceId', ParseIntPipe) resourceId: number,
    @Param('serviceId', ParseIntPipe) serviceId: number,
    @Body() resourceQuantity: ResourceByServiceDTO,
    @Res() res: Response,
  ) {
    await this.resourceService.createResourceForService(serviceId, resourceId, resourceQuantity.min_quantity);
    return res.status(201).send({ message: 'Recurso vínculado ao serviço com sucesso.' });
  }

  @Get()
  async listAllResources(@Res() res: Response) {
    const arrResources: Resource[] = await this.resourceService.listResources();
    return res.status(200).send(arrResources);
  }

  @Get('/service/:id')
  async listResourcesOfAService(@Param('id', ParseIntPipe) serviceId: number, @Res() res: Response) {
    const resources: null | ResourcesByService[] = await this.resourceService.listResourcesOfAService(serviceId);
    if (!resources)
      return res.status(404).send({ message: 'Recursos não foram encontrados para o serviço solicitado.' });

    return res.status(200).send(resources);
  }

  @Get(':id')
  async listOneResource(@Param('id', ParseIntPipe) resourceId: number, @Res() res: Response) {
    const resource: null | Resource = await this.resourceService.listOneResource(resourceId);
    if (!resource)
      return res.status(404).send({ message: 'Recurso não foi encontrado.' });

    return res.status(200).send(resource);
  }

  @Put(':id')
  async updateResource(@Param('id', ParseIntPipe) resourceId: number, @Body() resource: ResourceDTO, @Res() res: Response) {
    const update: UpdateResult = await this.resourceService.updateResource(resourceId, resource);
    if (update.affected === 0)
      return res.status(404).send({ message: 'Recurso não foi encontrado.' });

    res.status(201).send({ message: 'Recurso atualizado com sucesso.' });
  }

  @Put('service/:id')
  async updateResourceQuantityOfAService(@Param('id', ParseIntPipe) resourceServiceId: number, @Body() resourceQuantity: ResourceByServiceDTO, @Res() res: Response) {
    const update: UpdateResult = await this.resourceService.updateResourceQuantityOfAService(resourceServiceId, resourceQuantity.min_quantity);
    if (update.affected === 0)
      return res.status(404).send({ message: 'Recursos não foram encontrados para o serviço solicitado.' });

    res.status(201).send({ message: 'Quantidade de recurso atualizada com sucesso.' });
  }

  @Delete(':id')
  async deleteResource(@Param('id', ParseIntPipe) resourceId: number, @Res() res: Response) {
    const deleted: DeleteResult = await this.resourceService.deleteResource(resourceId);
    if (deleted.affected === 0)
      return res.status(404).send({ message: 'Recurso não foi encontrado.' });

    return res.status(200).send({ message: 'Recurso deletado com sucesso.' });
  }

  @Delete('/service/:id')
  async deleteResourceOfAService(@Param('id', ParseIntPipe) resourceServiceId: number, @Res() res: Response) {
    const deleted: DeleteResult = await this.resourceService.deleteResourceOfAService(resourceServiceId);
    if (deleted.affected === 0)
      return res.status(404).send({ message: 'Recursos não foram encontrados para o serviço solicitado.' });

    return res.status(200).send({ message: 'Recurso do serviço deletado com sucesso.' });
  }
}
