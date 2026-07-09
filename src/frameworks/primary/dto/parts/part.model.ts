import { IsNotEmpty, IsString } from 'class-validator';

export class PartDTO {
  @IsNotEmpty()
  @IsString()
  name: string;
}
