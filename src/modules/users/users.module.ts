import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/users.entity';
import { UsersController } from './users.controller';
import { UserService } from './users.service';

@Module({
  controllers: [UsersController],
  exports: [UserService],
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UserService],
})
export class UsersModule {}
