import { IsNumber, IsString } from 'class-validator';

export class ServicesDTO {
  @IsString() name: string;
  @IsNumber() cost: number;
}
