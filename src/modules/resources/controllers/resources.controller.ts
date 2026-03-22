import type { Response } from 'express';
import { Body, Controller, Delete, Get, Inject, Param, Post, Put, Res } from '@nestjs/common';
import { UpdateResult } from 'typeorm';
import { DeleteResult } from 'typeorm/browser';
import { Resource } from '../entities/resources.entity';
import { ResourceDTO } from '../models/resource.model';
import { ResourceService } from '../services/resources.service';

@Controller('resource')
export class ResourcesController {
  constructor(
    @Inject()
    private resourceService: ResourceService,
  ) { }

  @Post('/create')
  async createResource(@Body() resource: ResourceDTO, @Res() res: Response) {
    try {
      await this.resourceService.createResource(resource);
      return res.status(201).send({ message: 'Recurso criado com sucesso.' });
    }
    catch (error) {
      return res.status(500).send({ message: error });
    }
  }

  @Get('/list')
  async listAllResources(@Res() res: Response) {
    try {
      const arrResources: Resource[] = await this.resourceService.listResources();
      return res.status(200).send(arrResources);
    }
    catch (error) {
      return res.status(500).send({ message: error });
    }
  }

  @Get('/list/:id')
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

  @Put('/update/:id')
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

  @Delete('/remove/:id')
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
}
