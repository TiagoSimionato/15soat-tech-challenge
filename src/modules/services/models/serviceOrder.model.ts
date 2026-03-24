import { IsInt, IsNotEmpty } from 'class-validator';

export class ServiceOrderServiceDTO {
  @IsInt() id: number;
}
export class ServiceOrderDTO {
  @IsNotEmpty() @IsInt() user_id: number;
  @IsNotEmpty() @IsInt() vehicle_id: number;
  @IsNotEmpty() services: ServiceOrderServiceDTO[];
}
