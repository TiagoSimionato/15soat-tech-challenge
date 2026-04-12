import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString, ValidateNested } from 'class-validator';

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
