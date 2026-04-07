import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ResourceType, UnitType } from '../enums/resources.types';

export class ResourceDTO {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsEnum(ResourceType)
  type: string;

  @IsNumber()
  cost: number;

  @IsEnum(UnitType)
  unit: string;
}
