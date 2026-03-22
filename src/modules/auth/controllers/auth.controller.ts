import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { Public } from '../decorators/public';
import { SignInRequest } from '../requests/signIn';
import { SignUpRequest } from '../requests/signUp';
import { AuthService } from '../services/auth.service';

@Controller({ path: 'auth' })
export class AuthController {
  constructor(private authService: AuthService) {}

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
