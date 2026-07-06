import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ResourceType, UnitType } from '../../../../common/enums/resources/resources.enum';

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
