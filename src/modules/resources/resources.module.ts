import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResourceService } from '../../core/application/resources/resources.service';
import { ResourcesController } from '../../frameworks/primary/controllers/resources/resources.controller';
import { Resource } from '../../frameworks/secondary/resources/resources.entity';
import { ResourcesByService } from '../../frameworks/secondary/resources/resourcesByService.entity';

@Module({
  controllers: [ResourcesController],
  imports: [TypeOrmModule.forFeature([Resource, ResourcesByService])],
  providers: [ResourceService],
})
export class ResourcesModule {}
