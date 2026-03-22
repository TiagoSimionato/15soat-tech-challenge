import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResourcesController } from './controllers/resources.controller';
import { Resource } from './entities/resources.entity';
import { ResourceService } from './services/resources.service';

@Module({
  controllers: [ResourcesController],
  imports: [TypeOrmModule.forFeature([Resource])],
  providers: [ResourceService],
})
export class ResourcesModule {}
