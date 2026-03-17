import { IsNotEmpty } from 'class-validator';

export class SignUpRequest {
  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  name: string;
}
