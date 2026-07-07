import { IsNotEmpty } from 'class-validator';

export class SignInRequest {
  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  password: string;
}
