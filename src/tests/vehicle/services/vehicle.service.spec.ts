import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Vehicle } from '../../../frameworks/secondary/vehicle/vehicle.entity';
import { VehicleDTO } from '../../../frameworks/primary/dto/vehicle/vehicle.model';
import { VehicleService } from '../../../core/application/vehicle/vehicle.service';
import { isValidPlate } from '../../../utils/isValidPlate';

jest.mock('../../../utils/isValidPlate', () => ({
  isValidPlate: jest.fn(),
}));

const mockUserId = 1;

const mockVehicleDTO: VehicleDTO = {
  brand: 'Toyota',
  model: 'Corolla',
  plate: 'ABC1234',
  year: 2022,
};

const mockVehicleEntity: Vehicle = {
  brand: 'Toyota',
  id: 1,
  model: 'Corolla',
  plate: 'ABC1234',
  serviceOrder: [],
  user: { id: mockUserId } as any,
  year: 2022,
};

const mockRepository = () => ({
  create: jest.fn(),
  delete: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
});

describe('VehicleService', () => {
  let service: VehicleService;
  let repository: any;
  const mockedIsValidPlate = isValidPlate as jest.MockedFunction<typeof isValidPlate>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VehicleService,
        {
          provide: getRepositoryToken(Vehicle),
          useFactory: mockRepository,
        },
      ],
    }).compile();

    service = module.get<VehicleService>(VehicleService);
    repository = module.get(getRepositoryToken(Vehicle));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create and return a vehicle when plate is valid', async () => {
      mockedIsValidPlate.mockReturnValue(true);
      repository.create.mockReturnValue(mockVehicleEntity);
      repository.save.mockResolvedValue(mockVehicleEntity);

      const result = await service.create(mockVehicleDTO, mockUserId);

      expect(result).toEqual(mockVehicleEntity);
      expect(repository.create).toHaveBeenCalledWith({
        brand: mockVehicleDTO.brand,
        model: mockVehicleDTO.model,
        plate: mockVehicleDTO.plate,
        user: { id: mockUserId },
        year: mockVehicleDTO.year,
      });
      expect(repository.save).toHaveBeenCalledWith(mockVehicleEntity);
    });

    it('should throw BadRequestException when plate is invalid', async () => {
      mockedIsValidPlate.mockReturnValue(false);

      await expect(service.create(mockVehicleDTO, mockUserId)).rejects.toThrow(
        new BadRequestException('Invalid Plate'),
      );
      expect(repository.create).not.toHaveBeenCalled();
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('findAllUserVehicles', () => {
    it('should return all vehicles for the given user', async () => {
      repository.find.mockResolvedValue([mockVehicleEntity]);

      const result = await service.findAllUserVehicles(mockUserId);

      expect(result).toEqual([mockVehicleEntity]);
      expect(repository.find).toHaveBeenCalledWith({
        relations: ['user'],
        where: { user: { id: mockUserId } },
      });
    });

    it('should return an empty array when user has no vehicles', async () => {
      repository.find.mockResolvedValue([]);

      const result = await service.findAllUserVehicles(mockUserId);

      expect(result).toEqual([]);
    });
  });

  describe('findOneUserVehicle', () => {
    it('should return a vehicle when found', async () => {
      repository.findOne.mockResolvedValue(mockVehicleEntity);

      const result = await service.findOneUserVehicle('abc1234', mockUserId);

      expect(result).toEqual(mockVehicleEntity);
      expect(repository.findOne).toHaveBeenCalledWith({
        relations: ['user'],
        where: { plate: 'ABC1234', user: { id: mockUserId } },
      });
    });

    it('should convert plate to uppercase before querying', async () => {
      repository.findOne.mockResolvedValue(mockVehicleEntity);

      await service.findOneUserVehicle('abc1234', mockUserId);

      expect(repository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ plate: 'ABC1234' }) }),
      );
    });

    it('should throw NotFoundException when vehicle is not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOneUserVehicle('ABC1234', mockUserId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update and return the vehicle when data is valid', async () => {
      mockedIsValidPlate.mockReturnValue(true);
      repository.findOne.mockResolvedValue({ ...mockVehicleEntity });

      const updatedEntity = { ...mockVehicleEntity, color: 'White' };
      repository.save.mockResolvedValue(updatedEntity);

      const updateDTO: VehicleDTO = { ...mockVehicleDTO, brand: 'Honda', model: 'Civic' };
      const result = await service.update('abc1234', updateDTO, mockUserId);

      expect(result).toEqual(updatedEntity);
      expect(repository.save).toHaveBeenCalledTimes(1);
    });

    it('should convert plate to uppercase before querying', async () => {
      mockedIsValidPlate.mockReturnValue(true);
      repository.findOne.mockResolvedValue({ ...mockVehicleEntity });
      repository.save.mockResolvedValue(mockVehicleEntity);

      await service.update('abc1234', mockVehicleDTO, mockUserId);

      expect(repository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ plate: 'ABC1234' }) }),
      );
    });

    it('should throw BadRequestException when plate in DTO is invalid', async () => {
      mockedIsValidPlate.mockReturnValue(false);

      await expect(service.update('ABC1234', mockVehicleDTO, mockUserId)).rejects.toThrow(
        new BadRequestException('Invalid Plate'),
      );
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when vehicle does not belong to user', async () => {
      mockedIsValidPlate.mockReturnValue(true);
      repository.findOne.mockResolvedValue(null);

      await expect(service.update('ABC1234', mockVehicleDTO, mockUserId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should only update fields that are present in the DTO', async () => {
      mockedIsValidPlate.mockReturnValue(true);
      const existingVehicle = { ...mockVehicleEntity };
      repository.findOne.mockResolvedValue(existingVehicle);
      repository.save.mockResolvedValue(existingVehicle);

      const partialDTO: VehicleDTO = { brand: 'Honda', plate: 'ABC1234' } as VehicleDTO;
      await service.update('ABC1234', partialDTO, mockUserId);

      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({ brand: 'Honda', model: mockVehicleEntity.model }),
      );
    });
  });

  describe('remove', () => {
    it('should remove a vehicle successfully', async () => {
      repository.findOne.mockResolvedValue(mockVehicleEntity);
      repository.delete.mockResolvedValue({ affected: 1, raw: {} });

      await expect(service.remove('abc1234', mockUserId)).resolves.not.toThrow();
      expect(repository.delete).toHaveBeenCalledWith({ plate: 'ABC1234' });
    });

    it('should convert plate to uppercase before querying', async () => {
      repository.findOne.mockResolvedValue(mockVehicleEntity);
      repository.delete.mockResolvedValue({ affected: 1, raw: {} });

      await service.remove('abc1234', mockUserId);

      expect(repository.delete).toHaveBeenCalledWith({ plate: 'ABC1234' });
    });

    it('should throw NotFoundException when vehicle is not found for the user', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.remove('ABC1234', mockUserId)).rejects.toThrow(NotFoundException);
      expect(repository.delete).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when delete affects no rows', async () => {
      repository.findOne.mockResolvedValue(mockVehicleEntity);
      repository.delete.mockResolvedValue({ affected: 0, raw: {} });

      await expect(service.remove('ABC1234', mockUserId)).rejects.toThrow(NotFoundException);
    });
  });
});
