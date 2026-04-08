import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class ServicesDTO {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNumber()
  cost: number;
}
