import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VehicleDTO } from '../../../frameworks/primary/dto/vehicle/vehicle.model';
import { Vehicle } from '../../../frameworks/secondary/vehicle/vehicle.entity';
import { isValidPlate } from '../../../utils/isValidPlate';

const INVALID_PLATE_MESSAGE = 'Invalid Plate';

@Injectable()
export class VehicleService {
  constructor(
    @InjectRepository(Vehicle)
    private readonly vehicleRepository: Repository<Vehicle>,
  ) {}

  async create(dto: VehicleDTO, userId: number) {
    if (!isValidPlate(dto.plate)) {
      throw new BadRequestException(INVALID_PLATE_MESSAGE);
    }

    const vehicle = this.vehicleRepository.create({
      brand: dto.brand,
      model: dto.model,
      plate: dto.plate,
      user: { id: userId },
      year: dto.year,
    });
    return await this.vehicleRepository.save(vehicle);
  }

  async findAllUserVehicles(userId: number) {
    return await this.vehicleRepository.find({ relations: ['user'], where: { user: { id: userId } } });
  }

  async findOneUserVehicle(plate: string, userId: number) {
    plate = plate.toUpperCase();
    const vehicle = await this.vehicleRepository.findOne({ relations: ['user'], where: { plate, user: { id: userId } } });
    if (!vehicle) {
      throw new NotFoundException();
    }
    return vehicle;
  }

  async update(plate: string, dto: VehicleDTO, userId: number) {
    plate = plate.toUpperCase();
    if (!isValidPlate(dto.plate)) {
      throw new BadRequestException(INVALID_PLATE_MESSAGE);
    }

    const vehicle = await this.findOneUserVehicle(plate, userId);
    if (dto.year) {
      vehicle.year = dto.year;
    }
    if (dto.brand) {
      vehicle.brand = dto.brand;
    }
    if (dto.model) {
      vehicle.model = dto.model;
    }
    if (dto.plate) {
      vehicle.plate = dto.plate;
    }

    return await this.vehicleRepository.save(vehicle);
  }

  async remove(plate: string, userId: number) {
    plate = plate.toUpperCase();
    if (!(await this.findOneUserVehicle(plate, userId))) {
      throw new NotFoundException();
    }
    const result = await this.vehicleRepository.delete({ plate });
    if (result.affected === 0) {
      throw new NotFoundException();
    }
  }
}
