import type { Response } from 'express';
import { Body, Controller, Delete, Get, Inject, Param, ParseIntPipe, Post, Put, Res } from '@nestjs/common';
import { UpdateResult } from 'typeorm';
import { DeleteResult } from 'typeorm/browser';
import { Roles } from '../../../../common/enums/auth/roles.enum';
import { ResourceService } from '../../../../core/application/resources/resources.service';
import { ResourcesByService } from '../../../secondary/resources/resourcesByService.entity';
import { RequireRoles } from '../../decorators/auth/role.decorator';
import { ResourceByServiceDTO } from '../../dto/resources/resourceByService.model';

@RequireRoles([Roles.ADMIN])
@Controller('resources')
export class ResourcesController {
  constructor(
    @Inject()
    private readonly resourceService: ResourceService,
  ) { }

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

  @Get('/service/:id')
  async listResourcesOfAService(@Param('id', ParseIntPipe) serviceId: number, @Res() res: Response) {
    const resources: null | ResourcesByService[] = await this.resourceService.listResourcesOfAService(serviceId);
    if (!resources)
      return res.status(404).send({ message: 'Recursos não foram encontrados para o serviço solicitado.' });

    return res.status(200).send(resources);
  }

  @Put('service/:id')
  async updateResourceQuantityOfAService(@Param('id', ParseIntPipe) resourceServiceId: number, @Body() resourceQuantity: ResourceByServiceDTO, @Res() res: Response) {
    const update: UpdateResult = await this.resourceService.updateResourceQuantityOfAService(resourceServiceId, resourceQuantity.min_quantity);
    if (update.affected === 0)
      return res.status(404).send({ message: 'Recursos não foram encontrados para o serviço solicitado.' });

    res.status(201).send({ message: 'Quantidade de recurso atualizada com sucesso.' });
  }

  @Delete('/service/:id')
  async deleteResourceOfAService(@Param('id', ParseIntPipe) resourceServiceId: number, @Res() res: Response) {
    const deleted: DeleteResult = await this.resourceService.deleteResourceOfAService(resourceServiceId);
    if (deleted.affected === 0)
      return res.status(404).send({ message: 'Recursos não foram encontrados para o serviço solicitado.' });

    return res.status(200).send({ message: 'Recurso do serviço deletado com sucesso.' });
  }
}
