import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class VehicleDTO {
  @IsNotEmpty()
  @IsNumber()
  year: number;

  @IsNotEmpty()
  @IsString()
  brand: string;

  @IsNotEmpty()
  @IsString()
  model: string;

  @IsNotEmpty()
  @IsString()
  plate: string;
}
