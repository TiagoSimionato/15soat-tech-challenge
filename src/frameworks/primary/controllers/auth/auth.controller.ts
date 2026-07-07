import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from '../../../../core/application/auth/auth.service';
import { Public } from '../../decorators/auth/public.decorator';
import { SignInRequest } from '../../dto/auth/signIn.model';
import { SignUpRequest } from '../../dto/auth/signUp.model';

@Controller({ path: 'auth' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('/sign-in')
  async signIn(@Body() request: SignInRequest) {
    return this.authService.signIn(request.username, request.password);
  }

  @Public()
  @HttpCode(HttpStatus.CREATED)
  @Post('/sign-up')
  async signUp(@Body() request: SignUpRequest) {
    await this.authService.signUp(request);
  }
}
