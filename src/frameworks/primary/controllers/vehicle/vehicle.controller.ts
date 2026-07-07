import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { VehicleService } from '../../../../core/application/vehicle/vehicle.service';
import { CurrentUserId } from '../../decorators/auth/current-user.decorator';
import { VehicleDTO } from '../../dto/vehicle/vehicle.model';

@Controller('vehicles')
export class VehicleController {
  constructor(private readonly vehicleService: VehicleService) {}

  @Post()
  async create(@Body() createVehicleDto: VehicleDTO, @CurrentUserId() userId: number) {
    return await this.vehicleService.create(createVehicleDto, userId);
  }

  @Get()
  async listAll(@CurrentUserId() userId: number) {
    return await this.vehicleService.findAllUserVehicles(userId);
  }

  @Get(':plate')
  async listOne(@Param('plate') plate: string, @CurrentUserId() userId: number) {
    return await this.vehicleService.findOneUserVehicle(plate, userId);
  }

  @Put(':plate')
  async update(
    @Param('plate') plate: string,
    @Body() updateVehicleDto: VehicleDTO,
    @CurrentUserId() userId: number,
  ) {
    return await this.vehicleService.update(plate, updateVehicleDto, userId);
  }

  @Delete(':plate')
  async remove(@Param('plate') plate: string, @CurrentUserId() userId: number) {
    return await this.vehicleService.remove(plate, userId);
  }
}
