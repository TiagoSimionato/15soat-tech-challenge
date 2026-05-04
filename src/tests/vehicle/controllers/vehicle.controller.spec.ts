import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { VehicleController } from '../../../modules/vehicle/controllers/vehicle.controller';
import { VehicleDTO } from '../../../modules/vehicle/models/vehicle.model';
import { VehicleService } from '../../../modules/vehicle/services/vehicle.service';

const mockUserId = 1;

const mockVehicleDTO: VehicleDTO = {
  brand: 'Toyota',
  model: 'Corolla',
  plate: 'ABC1234',
  year: 2022,
};

const mockVehicleArray = [mockVehicleDTO];

const mockVehicleService = () => ({
  create: jest.fn(),
  findAllUserVehicles: jest.fn(),
  findOneUserVehicle: jest.fn(),
  remove: jest.fn(),
  update: jest.fn(),
});

describe('VehicleController', () => {
  let controller: VehicleController;
  let service: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VehicleController],
      providers: [
        {
          provide: VehicleService,
          useFactory: mockVehicleService,
        },
      ],
    }).compile();

    controller = module.get<VehicleController>(VehicleController);
    service = module.get(VehicleService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a vehicle and return it', async () => {
      service.create.mockResolvedValue(mockVehicleDTO);

      const result = await controller.create(mockVehicleDTO, mockUserId);

      expect(result).toEqual(mockVehicleDTO);
      expect(service.create).toHaveBeenCalledWith(mockVehicleDTO, mockUserId);
      expect(service.create).toHaveBeenCalledTimes(1);
    });

    it('should propagate errors thrown by the service', async () => {
      service.create.mockRejectedValue(new Error('Service error'));

      await expect(controller.create(mockVehicleDTO, mockUserId)).rejects.toThrow('Service error');
    });
  });

  describe('listAll', () => {
    it('should return an array of vehicles for the user', async () => {
      service.findAllUserVehicles.mockResolvedValue(mockVehicleArray);

      const result = await controller.listAll(mockUserId);

      expect(result).toEqual(mockVehicleArray);
      expect(service.findAllUserVehicles).toHaveBeenCalledWith(mockUserId);
      expect(service.findAllUserVehicles).toHaveBeenCalledTimes(1);
    });

    it('should return an empty array when user has no vehicles', async () => {
      service.findAllUserVehicles.mockResolvedValue([]);

      const result = await controller.listAll(mockUserId);

      expect(result).toEqual([]);
    });
  });

  describe('listOne', () => {
    it('should return a single vehicle by plate', async () => {
      service.findOneUserVehicle.mockResolvedValue(mockVehicleDTO);

      const result = await controller.listOne(mockVehicleDTO.plate, mockUserId);

      expect(result).toEqual(mockVehicleDTO);
      expect(service.findOneUserVehicle).toHaveBeenCalledWith(mockVehicleDTO.plate, mockUserId);
      expect(service.findOneUserVehicle).toHaveBeenCalledTimes(1);
    });

    it('should return null when vehicle is not found', async () => {
      service.findOneUserVehicle.mockResolvedValue(null);

      const result = await controller.listOne('NOTFOUND', mockUserId);

      expect(result).toBeNull();
      expect(service.findOneUserVehicle).toHaveBeenCalledWith('NOTFOUND', mockUserId);
    });
  });

  describe('update', () => {
    it('should update a vehicle and return the result', async () => {
      const updatedVehicle = { ...mockVehicleDTO, color: 'White' };
      service.update.mockResolvedValue(updatedVehicle);

      const result = await controller.update(mockVehicleDTO.plate, updatedVehicle, mockUserId);

      expect(result).toEqual(updatedVehicle);
      expect(service.update).toHaveBeenCalledWith(mockVehicleDTO.plate, updatedVehicle, mockUserId);
      expect(service.update).toHaveBeenCalledTimes(1);
    });

    it('should propagate errors thrown by the service', async () => {
      service.update.mockRejectedValue(new Error('Update error'));

      await expect(
        controller.update(mockVehicleDTO.plate, mockVehicleDTO, mockUserId),
      ).rejects.toThrow('Update error');
    });
  });

  describe('remove', () => {
    it('should remove a vehicle and return the result', async () => {
      service.remove.mockResolvedValue({ affected: 1, raw: {} });

      const result = await controller.remove(mockVehicleDTO.plate, mockUserId);

      expect(result).toEqual({ affected: 1, raw: {} });
      expect(service.remove).toHaveBeenCalledWith(mockVehicleDTO.plate, mockUserId);
      expect(service.remove).toHaveBeenCalledTimes(1);
    });

    it('should propagate errors thrown by the service', async () => {
      service.remove.mockRejectedValue(new Error('Remove error'));

      await expect(controller.remove(mockVehicleDTO.plate, mockUserId)).rejects.toThrow(
        'Remove error',
      );
    });
  });
});
