import { Module } from '@nestjs/common';
import { FallbackController } from '../../frameworks/primary/controllers/fallback/fallback.controller';

@Module({
  controllers: [FallbackController],
})
export class FallbackModule {}
