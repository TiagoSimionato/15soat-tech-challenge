import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { LoginRequest } from './auth.requests';
import { AuthService } from './auth.service';
import { Public } from './decorators/public';

@Controller({ path: 'auth' })
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('/login')
  signIn(@Body() request: LoginRequest) {
    return this.authService.signIn(request.username, request.password);
  }
}
