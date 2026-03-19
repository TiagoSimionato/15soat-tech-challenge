import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../users/users.service';
import { SignUpRequest } from './requests/signUp';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async signIn(username: string, password: string): Promise<any> {
    const user = await this.userService.findOne(username);

    const isAuthenticated = await bcrypt.compare(password, user?.password ?? '');

    if (!user || !isAuthenticated) {
      throw new UnauthorizedException();
    }
    const payload = {
      sub: user.id,
      username: user.username,
    };
    return { accessToken: this.jwtService.sign(payload) };
  }

  async signUp(signUpRequest: SignUpRequest) {
    await this.userService.create(signUpRequest);
  }
}
