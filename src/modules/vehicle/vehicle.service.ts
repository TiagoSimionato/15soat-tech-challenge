import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isValidPlate } from 'src/modules/vehicle/utils/isValidPlate';
import { Repository } from 'typeorm';
import { VehicleDTO } from './models/vehicle.model';
import { Vehicle } from './vehicle.entity';

const INVALID_PLATE_MESSAGE = 'Invalid Plate';

@Injectable()
export class VehicleService {
  constructor(
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
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

  async findOneUserVehicle(id: number, userId: number) {
    const vehicle = await this.vehicleRepository.findOne({ relations: ['user'], where: { id, user: { id: userId } } });
    if (!vehicle) {
      throw new NotFoundException();
    }
    return vehicle;
  }

  async update(id: number, dto: VehicleDTO, userId: number) {
    if (!isValidPlate(dto.plate)) {
      throw new BadRequestException(INVALID_PLATE_MESSAGE);
    }

    const vehicle = await this.findOneUserVehicle(id, userId);
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

  async remove(id: number, userId: number) {
    if (!(await this.findOneUserVehicle(id, userId))) {
      throw new NotFoundException();
    }
    const result = await this.vehicleRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException();
    }
  }
}
