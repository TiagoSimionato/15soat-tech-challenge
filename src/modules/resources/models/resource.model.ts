import { IsEnum, IsNumber, IsString } from 'class-validator';
import { ResourceType, UnitType } from '../enums/resources.types';

export class ResourceDTO {
  @IsString() name: string;
  @IsEnum(ResourceType) type: string;
  @IsNumber() cost: number;
  @IsEnum(UnitType) unit: string;
}
