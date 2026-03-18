import { Module } from '@nestjs/common';
import { ResourcesController } from './resources.controller';
import { ResourceService } from './resources.service';
import { Resource } from './entities/resources.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    controllers: [ResourcesController],
    imports: [TypeOrmModule.forFeature([Resource])],
    providers: [ResourceService]
})
export class ResourcesModule {}
