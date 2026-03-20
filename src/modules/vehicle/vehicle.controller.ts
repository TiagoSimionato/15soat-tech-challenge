import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { CurrentUserId } from '../auth/decorators/current-user';
import { VehicleDTO } from './models/vehicle.model';
import { VehicleService } from './vehicle.service';

@Controller('vehicles')
export class VehicleController {
  constructor(private readonly vehicleService: VehicleService) {}

  @Post('/create')
  async create(@Body() createVehicleDto: VehicleDTO, @CurrentUserId() userId: number) {
    return await this.vehicleService.create(createVehicleDto, userId);
  }

  @Get('/list')
  async listAll(@CurrentUserId() userId: number) {
    return await this.vehicleService.findAllUserVehicles(userId);
  }

  @Get('/list/:id')
  async listOne(@Param('id', ParseIntPipe) id: number, @CurrentUserId() userId: number) {
    return await this.vehicleService.findOneUserVehicle(id, userId);
  }

  @Put('/update/:id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateVehicleDto: VehicleDTO,
    @CurrentUserId() userId: number,
  ) {
    return await this.vehicleService.update(id, updateVehicleDto, userId);
  }

  @Delete('/remove/:id')
  async remove(@Param('id', ParseIntPipe) id: number, @CurrentUserId() userId: number) {
    return await this.vehicleService.remove(id, userId);
  }
}
