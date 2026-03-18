import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Resource } from './entities/resources.entity';
import { ResourcesController } from './resources.controller';
import { ResourceService } from './resources.service';

@Module({
  controllers: [ResourcesController],
  imports: [TypeOrmModule.forFeature([Resource])],
  providers: [ResourceService],
})
export class ResourcesModule {}
