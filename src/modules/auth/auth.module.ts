import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { jwtConstants } from '../../common/constants/auth/auth.constants';
import { AuthController } from '../../frameworks/primary/controllers/auth/auth.controller';
import { AuthGuard } from '../../frameworks/primary/guards/auth.guard';
import { RolesGuard } from '../../frameworks/primary/guards/roles.guard';
import { AuthService } from '../../core/application/auth/auth.service';

@Module({
  controllers: [AuthController],
  imports: [
    UsersModule,
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: 3600 * 24 },
    }),
  ],
  providers: [
    AuthService,
    {
      provide: 'APP_GUARD',
      useClass: AuthGuard,
    },
    {
      provide: 'APP_GUARD',
      useClass: RolesGuard,
    },
  ],
})
export class AuthModule {}
