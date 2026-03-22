import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './controllers/users.controller';
import { User } from './entities/users.entity';
import { UserService } from './services/users.service';

@Module({
  controllers: [UsersController],
  exports: [UserService],
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UserService],
})
export class UsersModule {}
