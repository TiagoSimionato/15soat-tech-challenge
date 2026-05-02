import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { LegalNature } from '../../users/enums/legalNature';

type UserConstructor = {
  document: string;
  id: number;
  legalNature: LegalNature;
  name: string;
  username: string;
};

export class UserResponseDTO {
  constructor({ document, id, legalNature, name, username }: UserConstructor) {
    this.id = id;
    this.document = document;
    this.legalNature = legalNature;
    this.name = name;
    this.username = username;
  }

  @IsNotEmpty()
  @IsNumber()
  id: number;

  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  document: string;

  @IsEnum(LegalNature, { message: 'legalNature must be [PF] or [PJ]' })
  legalNature: LegalNature;
}
