import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, ValidateNested } from 'class-validator';

export class ServiceOrderServiceDTO {
  @IsInt()
  id: number;
}

export class ServiceOrderDTO {
  @IsInt()
  user_id: number;

  @IsInt()
  vehicle_id: number;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ServiceOrderServiceDTO)
  services: ServiceOrderServiceDTO[];
}
