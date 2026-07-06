import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Services } from '../../../frameworks/secondary/services/services.entity';
import { ServicesDTO } from '../../../frameworks/primary/dto/services/services.model';
import { ServicesService } from '../../../core/application/services/services.service';

const mockServicesEntity: Services = {
  cost: 100,
  id: 1,
  name: 'Service A',
  requestedService: {} as any,
  resources: [],
};

const mockServicesDTO: ServicesDTO = {
  cost: 100,
  name: 'Service A',
};

const mockRepository = () => ({
  create: jest.fn(),
  delete: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
});

const mockEntityManager = () => {
  const mockRepo = {
    findOne: jest.fn() as jest.MockedFunction<any>,
  };
  const manager = {
    getRepository: jest.fn().mockReturnValue(mockRepo),
  };
  return { manager, mockRepo };
};

describe('ServicesService', () => {
  let service: ServicesService;
  let repository: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServicesService,
        {
          provide: getRepositoryToken(Services),
          useFactory: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ServicesService>(ServicesService);
    repository = module.get(getRepositoryToken(Services));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createService', () => {
    it('should create and save a service', async () => {
      repository.create.mockReturnValue(mockServicesEntity);
      repository.save.mockResolvedValue(mockServicesEntity as never);

      await service.createService(mockServicesDTO);

      expect(repository.create).toHaveBeenCalledWith(mockServicesDTO);
      expect(repository.create).toHaveBeenCalledTimes(1);
      expect(repository.save).toHaveBeenCalledWith(mockServicesEntity);
      expect(repository.save).toHaveBeenCalledTimes(1);
    });

    it('should propagate errors thrown by save', async () => {
      repository.create.mockReturnValue(mockServicesEntity);
      repository.save.mockRejectedValue(new Error('DB error') as never);

      await expect(service.createService(mockServicesDTO)).rejects.toThrow('DB error');
    });
  });

  describe('listServices', () => {
    it('should return all services', async () => {
      repository.find.mockResolvedValue([mockServicesEntity] as never);

      const result = await service.listServices();

      expect(repository.find).toHaveBeenCalledTimes(1);
      expect(result).toEqual([mockServicesEntity]);
    });

    it('should return an empty array when no services exist', async () => {
      repository.find.mockResolvedValue([] as never);

      const result = await service.listServices();

      expect(result).toEqual([]);
    });

    it('should propagate errors thrown by find', async () => {
      repository.find.mockRejectedValue(new Error('DB error') as never);

      await expect(service.listServices()).rejects.toThrow('DB error');
    });
  });

  describe('listOneService', () => {
    it('should return a service when found using own repository', async () => {
      repository.findOne.mockResolvedValue(mockServicesEntity as never);

      const result = await service.listOneService(1);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(repository.findOne).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockServicesEntity);
    });

    it('should return null when service is not found', async () => {
      repository.findOne.mockResolvedValue(null as never);

      const result = await service.listOneService(99);

      expect(result).toBeNull();
    });

    it('should use EntityManager repository when manager is provided', async () => {
      const { manager, mockRepo } = mockEntityManager();
      mockRepo.findOne.mockResolvedValue(mockServicesEntity);

      const result = await service.listOneService(1, manager as any);

      expect(manager.getRepository).toHaveBeenCalledWith(Services);
      expect(mockRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(mockServicesEntity);
      expect(repository.findOne).not.toHaveBeenCalled();
    });

    it('should return null via EntityManager when service is not found', async () => {
      const { manager, mockRepo } = mockEntityManager();
      mockRepo.findOne.mockResolvedValue(null);

      const result = await service.listOneService(99, manager as any);

      expect(result).toBeNull();
      expect(repository.findOne).not.toHaveBeenCalled();
    });

    it('should propagate errors thrown by findOne', async () => {
      repository.findOne.mockRejectedValue(new Error('DB error') as never);

      await expect(service.listOneService(1)).rejects.toThrow('DB error');
    });
  });

  describe('updateService', () => {
    it('should update a service and return the UpdateResult', async () => {
      const updateResult = { affected: 1, generatedMaps: [], raw: {} };
      repository.update.mockResolvedValue(updateResult as never);

      const result = await service.updateService(1, mockServicesDTO);

      expect(repository.update).toHaveBeenCalledWith({ id: 1 }, mockServicesDTO);
      expect(repository.update).toHaveBeenCalledTimes(1);
      expect(result).toEqual(updateResult);
    });

    it('should return affected: 0 when service does not exist', async () => {
      const updateResult = { affected: 0, generatedMaps: [], raw: {} };
      repository.update.mockResolvedValue(updateResult as never);

      const result = await service.updateService(99, mockServicesDTO);

      expect(result).toEqual(updateResult);
    });

    it('should propagate errors thrown by update', async () => {
      repository.update.mockRejectedValue(new Error('DB error') as never);

      await expect(service.updateService(1, mockServicesDTO)).rejects.toThrow('DB error');
    });
  });

  describe('deleteService', () => {
    it('should delete a service and return the DeleteResult', async () => {
      const deleteResult = { affected: 1, raw: {} };
      repository.delete.mockResolvedValue(deleteResult as never);

      const result = await service.deleteService(1);

      expect(repository.delete).toHaveBeenCalledWith({ id: 1 });
      expect(repository.delete).toHaveBeenCalledTimes(1);
      expect(result).toEqual(deleteResult);
    });

    it('should return affected: 0 when service does not exist', async () => {
      const deleteResult = { affected: 0, raw: {} };
      repository.delete.mockResolvedValue(deleteResult as never);

      const result = await service.deleteService(99);

      expect(result).toEqual(deleteResult);
    });

    it('should propagate errors thrown by delete', async () => {
      repository.delete.mockRejectedValue(new Error('DB error') as never);

      await expect(service.deleteService(1)).rejects.toThrow('DB error');
    });
  });
});
