import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { LegalNature } from '../../../../common/enums/users/legalNature.enum';

export class SignUpRequest {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  document: string;

  @IsEnum(LegalNature, { message: 'legalNature must be [PF] or [PJ]' })
  legalNature: LegalNature;
}
