import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ResourceService } from '../../../core/application/resources/resources.service';
import { ResourcesByService } from '../../../frameworks/secondary/resources/resourcesByService.entity';

const mockResourcesByService: ResourcesByService = {
  id: 1,
  min_quantity: 5,
  resource: 'resource',
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
  let resourceByServiceRepository: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResourceService,
        {
          provide: getRepositoryToken(ResourcesByService),
          useFactory: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ResourceService>(ResourceService);
    resourceByServiceRepository = module.get(getRepositoryToken(ResourcesByService));
  });

  afterEach(() => {
    jest.clearAllMocks();
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
