import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResourcesController } from './controllers/resources.controller';
import { Resource } from './entities/resources.entity';
import { ResourcesByService } from './entities/resourcesByService.entity';
import { ResourceService } from './services/resources.service';

@Module({
  controllers: [ResourcesController],
  imports: [TypeOrmModule.forFeature([Resource, ResourcesByService])],
  providers: [ResourceService],
})
export class ResourcesModule {}
