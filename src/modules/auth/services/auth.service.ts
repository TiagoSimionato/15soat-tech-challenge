import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../../users/services/users.service';
import { SignUpRequest } from '../requests/signUp.model';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async signIn(username: string, password: string): Promise<any> {
    const user = await this.userService.findOne(username);

    const isAuthenticated = await bcrypt.compare(password, user?.password ?? '');

    if (!user || !isAuthenticated) {
      throw new UnauthorizedException();
    }
    const payload = {
      roles: user.roles.map(it => it.authority),
      sub: user.id,
      username: user.username,
    };
    return { accessToken: this.jwtService.sign(payload) };
  }

  async signUp(signUpRequest: SignUpRequest) {
    await this.userService.create(signUpRequest);
  }
}
