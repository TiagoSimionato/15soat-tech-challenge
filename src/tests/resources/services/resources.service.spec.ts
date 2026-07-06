import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Resource } from '../../../frameworks/secondary/resources/resources.entity';
import { ResourcesByService } from '../../../frameworks/secondary/resources/resourcesByService.entity';
import { ResourceDTO } from '../../../frameworks/primary/dto/resources/resource.model';
import { ResourceService } from '../../../core/application/resources/resources.service';

const mockResourceEntity: Resource = {
  cost: 100,
  id: 1,
  name: 'Resource A',
  services: [],
  type: 'type-a',
  unit: 'unit-a',
};

const mockResourceDTO: ResourceDTO = {
  cost: 100,
  name: 'Resource A',
  type: 'type-a',
  unit: 'unit-a',
};

const mockResourcesByService: ResourcesByService = {
  id: 1,
  min_quantity: 5,
  resource: mockResourceEntity,
  service: { id: 1 } as any,
};

const mockRepository = () => ({
  create: jest.fn(),
  delete: jest.fn(),
  find: jest.fn(),
  findOneBy: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
});

const mockEntityManager = () => {
  const mockRepo = {
    find: jest.fn() as jest.MockedFunction<any>,
    findOneBy: jest.fn() as jest.MockedFunction<any>,
  };
  const manager = {
    getRepository: jest.fn().mockReturnValue(mockRepo),
  };
  return { manager, mockRepo };
};

describe('ResourceService', () => {
  let service: ResourceService;
  let resourceRepository: any;
  let resourceByServiceRepository: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResourceService,
        {
          provide: getRepositoryToken(Resource),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(ResourcesByService),
          useFactory: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ResourceService>(ResourceService);
    resourceRepository = module.get(getRepositoryToken(Resource));
    resourceByServiceRepository = module.get(getRepositoryToken(ResourcesByService));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createResource', () => {
    it('should create and save a resource', async () => {
      resourceRepository.create.mockReturnValue(mockResourceEntity);
      resourceRepository.save.mockResolvedValue(mockResourceEntity as never);

      await service.createResource(mockResourceDTO);

      expect(resourceRepository.create).toHaveBeenCalledWith({
        cost: mockResourceDTO.cost,
        name: mockResourceDTO.name,
        type: mockResourceDTO.type,
        unit: mockResourceDTO.unit,
      });
      expect(resourceRepository.save).toHaveBeenCalledWith(mockResourceEntity);
      expect(resourceRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should propagate errors thrown by save', async () => {
      resourceRepository.create.mockReturnValue(mockResourceEntity);
      resourceRepository.save.mockRejectedValue(new Error('DB error') as never);

      await expect(service.createResource(mockResourceDTO)).rejects.toThrow('DB error');
    });
  });

  describe('createResourceForService', () => {
    it('should create and save a resource for a service', async () => {
      resourceByServiceRepository.create.mockReturnValue(mockResourcesByService);
      resourceByServiceRepository.save.mockResolvedValue(mockResourcesByService as never);

      await service.createResourceForService(1, 1, 5);

      expect(resourceByServiceRepository.create).toHaveBeenCalledWith({
        min_quantity: 5,
        resource: { id: 1 },
        service: { id: 1 },
      });
      expect(resourceByServiceRepository.save).toHaveBeenCalledWith(mockResourcesByService);
      expect(resourceByServiceRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should propagate errors thrown by save', async () => {
      resourceByServiceRepository.create.mockReturnValue(mockResourcesByService);
      resourceByServiceRepository.save.mockRejectedValue(new Error('DB error') as never);

      await expect(service.createResourceForService(1, 1, 5)).rejects.toThrow('DB error');
    });
  });

  describe('listResources', () => {
    it('should return all resources', async () => {
      resourceRepository.find.mockResolvedValue([mockResourceEntity] as never);

      const result = await service.listResources();

      expect(resourceRepository.find).toHaveBeenCalledTimes(1);
      expect(result).toEqual([mockResourceEntity]);
    });

    it('should return an empty array when no resources exist', async () => {
      resourceRepository.find.mockResolvedValue([] as never);

      const result = await service.listResources();

      expect(result).toEqual([]);
    });

    it('should propagate errors thrown by find', async () => {
      resourceRepository.find.mockRejectedValue(new Error('DB error') as never);

      await expect(service.listResources()).rejects.toThrow('DB error');
    });
  });

  describe('listResourcesOfAService', () => {
    const expectedQuery = {
      relations: ['resource'],
      where: { service: { id: 1 } },
    };

    it('should return resources of a service using own repository', async () => {
      resourceByServiceRepository.find.mockResolvedValue([mockResourcesByService] as never);

      const result = await service.listResourcesOfAService(1);

      expect(resourceByServiceRepository.find).toHaveBeenCalledWith(expectedQuery);
      expect(result).toEqual([mockResourcesByService]);
    });

    it('should use EntityManager repository when manager is provided', async () => {
      const { manager, mockRepo } = mockEntityManager();
      mockRepo.find.mockResolvedValue([mockResourcesByService]);

      const result = await service.listResourcesOfAService(1, manager as any);

      expect(manager.getRepository).toHaveBeenCalledWith(ResourcesByService);
      expect(mockRepo.find).toHaveBeenCalledWith(expectedQuery);
      expect(result).toEqual([mockResourcesByService]);
      expect(resourceByServiceRepository.find).not.toHaveBeenCalled();
    });

    it('should return empty array when service has no resources', async () => {
      resourceByServiceRepository.find.mockResolvedValue([] as never);

      const result = await service.listResourcesOfAService(99);

      expect(result).toEqual([]);
    });

    it('should propagate errors thrown by find', async () => {
      resourceByServiceRepository.find.mockRejectedValue(new Error('DB error') as never);

      await expect(service.listResourcesOfAService(1)).rejects.toThrow('DB error');
    });
  });

  describe('listOneResource', () => {
    it('should return a resource when found using own repository', async () => {
      resourceRepository.findOneBy.mockResolvedValue(mockResourceEntity as never);

      const result = await service.listOneResource(1);

      expect(resourceRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(result).toEqual(mockResourceEntity);
    });

    it('should return null when resource is not found', async () => {
      resourceRepository.findOneBy.mockResolvedValue(null as never);

      const result = await service.listOneResource(99);

      expect(result).toBeNull();
    });

    it('should use EntityManager repository when manager is provided', async () => {
      const { manager, mockRepo } = mockEntityManager();
      mockRepo.findOneBy.mockResolvedValue(mockResourceEntity);

      const result = await service.listOneResource(1, manager as any);

      expect(manager.getRepository).toHaveBeenCalledWith(Resource);
      expect(mockRepo.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(result).toEqual(mockResourceEntity);
      expect(resourceRepository.findOneBy).not.toHaveBeenCalled();
    });

    it('should propagate errors thrown by findOneBy', async () => {
      resourceRepository.findOneBy.mockRejectedValue(new Error('DB error') as never);

      await expect(service.listOneResource(1)).rejects.toThrow('DB error');
    });
  });

  describe('updateResource', () => {
    it('should update a resource and return the UpdateResult', async () => {
      const updateResult = { affected: 1, generatedMaps: [], raw: {} };
      resourceRepository.update.mockResolvedValue(updateResult as never);

      const result = await service.updateResource(1, mockResourceDTO);

      expect(resourceRepository.update).toHaveBeenCalledWith({ id: 1 }, mockResourceDTO);
      expect(resourceRepository.update).toHaveBeenCalledTimes(1);
      expect(result).toEqual(updateResult);
    });

    it('should return affected: 0 when resource does not exist', async () => {
      const updateResult = { affected: 0, generatedMaps: [], raw: {} };
      resourceRepository.update.mockResolvedValue(updateResult as never);

      const result = await service.updateResource(99, mockResourceDTO);

      expect(result).toEqual(updateResult);
    });

    it('should propagate errors thrown by update', async () => {
      resourceRepository.update.mockRejectedValue(new Error('DB error') as never);

      await expect(service.updateResource(1, mockResourceDTO)).rejects.toThrow('DB error');
    });
  });

  describe('updateResourceQuantityOfAService', () => {
    it('should update the min_quantity of a resource in a service', async () => {
      const updateResult = { affected: 1, generatedMaps: [], raw: {} };
      resourceByServiceRepository.update.mockResolvedValue(updateResult as never);

      const result = await service.updateResourceQuantityOfAService(1, 20);

      expect(resourceByServiceRepository.update).toHaveBeenCalledWith({ id: 1 }, { min_quantity: 20 });
      expect(resourceByServiceRepository.update).toHaveBeenCalledTimes(1);
      expect(result).toEqual(updateResult);
    });

    it('should return affected: 0 when resource-service relation does not exist', async () => {
      const updateResult = { affected: 0, generatedMaps: [], raw: {} };
      resourceByServiceRepository.update.mockResolvedValue(updateResult as never);

      const result = await service.updateResourceQuantityOfAService(99, 20);

      expect(result).toEqual(updateResult);
    });

    it('should propagate errors thrown by update', async () => {
      resourceByServiceRepository.update.mockRejectedValue(new Error('DB error') as never);

      await expect(service.updateResourceQuantityOfAService(1, 20)).rejects.toThrow('DB error');
    });
  });

  describe('deleteResource', () => {
    it('should delete a resource and return the DeleteResult', async () => {
      const deleteResult = { affected: 1, raw: {} };
      resourceRepository.delete.mockResolvedValue(deleteResult as never);

      const result = await service.deleteResource(1);

      expect(resourceRepository.delete).toHaveBeenCalledWith({ id: 1 });
      expect(resourceRepository.delete).toHaveBeenCalledTimes(1);
      expect(result).toEqual(deleteResult);
    });

    it('should return affected: 0 when resource does not exist', async () => {
      const deleteResult = { affected: 0, raw: {} };
      resourceRepository.delete.mockResolvedValue(deleteResult as never);

      const result = await service.deleteResource(99);

      expect(result).toEqual(deleteResult);
    });

    it('should propagate errors thrown by delete', async () => {
      resourceRepository.delete.mockRejectedValue(new Error('DB error') as never);

      await expect(service.deleteResource(1)).rejects.toThrow('DB error');
    });
  });

  describe('deleteResourceOfAService', () => {
    it('should delete a resource-service relation and return the DeleteResult', async () => {
      const deleteResult = { affected: 1, raw: {} };
      resourceByServiceRepository.delete.mockResolvedValue(deleteResult as never);

      const result = await service.deleteResourceOfAService(1);

      expect(resourceByServiceRepository.delete).toHaveBeenCalledWith({ id: 1 });
      expect(resourceByServiceRepository.delete).toHaveBeenCalledTimes(1);
      expect(result).toEqual(deleteResult);
    });

    it('should return affected: 0 when resource-service relation does not exist', async () => {
      const deleteResult = { affected: 0, raw: {} };
      resourceByServiceRepository.delete.mockResolvedValue(deleteResult as never);

      const result = await service.deleteResourceOfAService(99);

      expect(result).toEqual(deleteResult);
    });

    it('should propagate errors thrown by delete', async () => {
      resourceByServiceRepository.delete.mockRejectedValue(new Error('DB error') as never);

      await expect(service.deleteResourceOfAService(1)).rejects.toThrow('DB error');
    });
  });
});
