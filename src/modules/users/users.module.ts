import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from '../../frameworks/primary/controllers/users/users.controller';
import { User } from '../../frameworks/secondary/users/users.entity';
import { UserService } from '../../core/application/users/users.service';

@Module({
  controllers: [UsersController],
  exports: [UserService],
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UserService],
})
export class UsersModule {}
