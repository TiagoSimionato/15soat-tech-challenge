import { IsNotEmpty, IsNumber } from 'class-validator';

export class ResourceByServiceDTO {
  @IsNotEmpty() @IsNumber() min_quantity: number;
}
