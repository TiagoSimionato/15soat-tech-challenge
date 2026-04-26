import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsNotEmpty, IsString, ValidateNested } from 'class-validator';

export class ServiceOrderServiceDTO {
  @IsInt()
  id: number;
}

export class ServiceOrderDTO {
  @IsNotEmpty()
  @IsString()
  userDocument: string;

  @IsInt()
  vehicleId: number;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ServiceOrderServiceDTO)
  services: ServiceOrderServiceDTO[];
}

export class VehicleArrivedDTO {
  @IsDateString()
  vehicle_arrived_at: string;
}

export class DeliverServiceOrderDTO {
  @IsDateString()
  vehicle_delivered_at: string;
}
