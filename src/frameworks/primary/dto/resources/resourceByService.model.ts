import { IsInt, IsNotEmpty } from 'class-validator';

export class ResourceByServiceDTO {
  @IsNotEmpty() @IsInt() min_quantity: number;
}
