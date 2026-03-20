import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Services } from './entities/services.entity';
import { ServicesController } from './services.controller';
import { ServicesService } from './services.service';

@Module({
  controllers: [ServicesController],
  imports: [TypeOrmModule.forFeature([Services])],
  providers: [ServicesService],
})
export class ServicesModule {}
