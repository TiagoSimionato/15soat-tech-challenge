import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { ResourceService } from '../../../core/application/resources/resources.service';
import { ResourcesController } from '../../../frameworks/primary/controllers/resources/resources.controller';
import { ResourceByServiceDTO } from '../../../frameworks/primary/dto/resources/resourceByService.model';
import { ResourcesByService } from '../../../frameworks/secondary/resources/resourcesByService.entity';

const mockResourceByServiceDTO: ResourceByServiceDTO = {
  min_quantity: 5,
};

const mockResourcesByService: ResourcesByService = {
  id: 1,
  min_quantity: 5,
  resource_id: 1,
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
