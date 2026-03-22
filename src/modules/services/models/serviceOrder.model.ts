import { IsInt, IsNotEmpty, IsNumber } from 'class-validator';

export class ServiceOrderDTO {
  @IsNotEmpty() @IsNumber() budget: number;
  @IsNotEmpty() @IsInt() user_id: number;
  @IsNotEmpty() @IsInt() vehicle_id: number;
}
