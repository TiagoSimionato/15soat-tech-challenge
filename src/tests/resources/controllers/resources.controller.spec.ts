import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { ResourcesController } from '../../../modules/resources/controllers/resources.controller';
import { Resource } from '../../../modules/resources/entities/resources.entity';
import { ResourcesByService } from '../../../modules/resources/entities/resourcesByService.entity';
import { ResourceDTO } from '../../../modules/resources/models/resource.model';
import { ResourceByServiceDTO } from '../../../modules/resources/models/resourceByService.model';
import { ResourceService } from '../../../modules/resources/services/resources.service';

const mockResourceDTO: ResourceDTO = {
  cost: 100,
  name: 'Resource A',
  type: 'type-a',
  unit: 'unit-a',
};

const mockResourceByServiceDTO: ResourceByServiceDTO = {
  min_quantity: 5,
};

const mockResourceEntity: Resource = {
  cost: 100,
  id: 1,
  name: 'Resource A',
  services: [],
  type: 'type-a',
  unit: 'unit-a',
};

const mockResourcesByService: ResourcesByService = {
  id: 1,
  min_quantity: 5,
  resource: mockResourceEntity,
  service: { id: 1 } as any,
};

const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

const mockResourceService = () => ({
  createResource: jest.fn(),
  createResourceForService: jest.fn(),
  deleteResource: jest.fn(),
  deleteResourceOfAService: jest.fn(),
  listOneResource: jest.fn(),
  listResources: jest.fn(),
  listResourcesOfAService: jest.fn(),
  updateResource: jest.fn(),
  updateResourceQuantityOfAService: jest.fn(),
});

describe('ResourcesController', () => {
  let controller: ResourcesController;
  let service: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ResourcesController],
      providers: [
        {
          provide: ResourceService,
          useFactory: mockResourceService,
        },
      ],
    }).compile();

    controller = module.get<ResourcesController>(ResourcesController);
    service = module.get(ResourceService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createResource', () => {
    it('should return 201 when resource is created successfully', async () => {
      service.createResource.mockResolvedValue(undefined);
      const res = mockResponse();

      await controller.createResource(mockResourceDTO, res);

      expect(service.createResource).toHaveBeenCalledWith(mockResourceDTO);
      expect(service.createResource).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.send).toHaveBeenCalledWith({ message: 'Recurso criado com sucesso.' });
    });
  });

  describe('createResourceForService', () => {
    it('should return 201 when resource is linked to service successfully', async () => {
      service.createResourceForService.mockResolvedValue(undefined);
      const res = mockResponse();

      await controller.createResourceForService(1, 1, mockResourceByServiceDTO, res);

      expect(service.createResourceForService).toHaveBeenCalledWith(1, 1, mockResourceByServiceDTO.min_quantity);
      expect(service.createResourceForService).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.send).toHaveBeenCalledWith({ message: 'Recurso vínculado ao serviço com sucesso.' });
    });
  });

  describe('listAllResources', () => {
    it('should return 200 with all resources', async () => {
      service.listResources.mockResolvedValue([mockResourceEntity]);
      const res = mockResponse();

      await controller.listAllResources(res);

      expect(service.listResources).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith([mockResourceEntity]);
    });

    it('should return 200 with empty array when no resources exist', async () => {
      service.listResources.mockResolvedValue([]);
      const res = mockResponse();

      await controller.listAllResources(res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith([]);
    });
  });

  describe('listResourcesOfAService', () => {
    it('should return 200 with resources of the service', async () => {
      service.listResourcesOfAService.mockResolvedValue([mockResourcesByService]);
      const res = mockResponse();

      await controller.listResourcesOfAService(1, res);

      expect(service.listResourcesOfAService).toHaveBeenCalledWith(1);
      expect(service.listResourcesOfAService).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith([mockResourcesByService]);
    });

    it('should return 404 when resources are not found', async () => {
      service.listResourcesOfAService.mockResolvedValue(null);
      const res = mockResponse();

      await controller.listResourcesOfAService(99, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith({
        message: 'Recursos não foram encontrados para o serviço solicitado.',
      });
    });
  });

  describe('listOneResource', () => {
    it('should return 200 with the resource when found', async () => {
      service.listOneResource.mockResolvedValue(mockResourceEntity);
      const res = mockResponse();

      await controller.listOneResource(1, res);

      expect(service.listOneResource).toHaveBeenCalledWith(1);
      expect(service.listOneResource).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(mockResourceEntity);
    });

    it('should return 404 when resource is not found', async () => {
      service.listOneResource.mockResolvedValue(null);
      const res = mockResponse();

      await controller.listOneResource(99, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith({ message: 'Recurso não foi encontrado.' });
    });
  });

  describe('updateResource', () => {
    it('should return 201 when resource is updated successfully', async () => {
      service.updateResource.mockResolvedValue({ affected: 1, generatedMaps: [], raw: {} });
      const res = mockResponse();

      await controller.updateResource(1, mockResourceDTO, res);

      expect(service.updateResource).toHaveBeenCalledWith(1, mockResourceDTO);
      expect(service.updateResource).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.send).toHaveBeenCalledWith({ message: 'Recurso atualizado com sucesso.' });
    });

    it('should return 404 when resource is not found', async () => {
      service.updateResource.mockResolvedValue({ affected: 0, generatedMaps: [], raw: {} });
      const res = mockResponse();

      await controller.updateResource(99, mockResourceDTO, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith({ message: 'Recurso não foi encontrado.' });
    });
  });

  describe('updateResourceQuantityOfAService', () => {
    it('should return 201 when quantity is updated successfully', async () => {
      service.updateResourceQuantityOfAService.mockResolvedValue({ affected: 1, generatedMaps: [], raw: {} });
      const res = mockResponse();

      await controller.updateResourceQuantityOfAService(1, mockResourceByServiceDTO, res);

      expect(service.updateResourceQuantityOfAService).toHaveBeenCalledWith(1, mockResourceByServiceDTO.min_quantity);
      expect(service.updateResourceQuantityOfAService).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.send).toHaveBeenCalledWith({ message: 'Quantidade de recurso atualizada com sucesso.' });
    });

    it('should return 404 when resource-service relation is not found', async () => {
      service.updateResourceQuantityOfAService.mockResolvedValue({ affected: 0, generatedMaps: [], raw: {} });
      const res = mockResponse();

      await controller.updateResourceQuantityOfAService(99, mockResourceByServiceDTO, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith({
        message: 'Recursos não foram encontrados para o serviço solicitado.',
      });
    });
  });

  describe('deleteResource', () => {
    it('should return 200 when resource is deleted successfully', async () => {
      service.deleteResource.mockResolvedValue({ affected: 1, raw: {} });
      const res = mockResponse();

      await controller.deleteResource(1, res);

      expect(service.deleteResource).toHaveBeenCalledWith(1);
      expect(service.deleteResource).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({ message: 'Recurso deletado com sucesso.' });
    });

    it('should return 404 when resource is not found', async () => {
      service.deleteResource.mockResolvedValue({ affected: 0, raw: {} });
      const res = mockResponse();

      await controller.deleteResource(99, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith({ message: 'Recurso não foi encontrado.' });
    });
  });

  describe('deleteResourceOfAService', () => {
    it('should return 200 when resource-service relation is deleted successfully', async () => {
      service.deleteResourceOfAService.mockResolvedValue({ affected: 1, raw: {} });
      const res = mockResponse();

      await controller.deleteResourceOfAService(1, res);

      expect(service.deleteResourceOfAService).toHaveBeenCalledWith(1);
      expect(service.deleteResourceOfAService).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({ message: 'Recurso do serviço deletado com sucesso.' });
    });

    it('should return 404 when resource-service relation is not found', async () => {
      service.deleteResourceOfAService.mockResolvedValue({ affected: 0, raw: {} });
      const res = mockResponse();

      await controller.deleteResourceOfAService(99, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith({
        message: 'Recursos não foram encontrados para o serviço solicitado.',
      });
    });
  });
});
