import { Module } from '@nestjs/common';
import { FallbackController } from './controllers/fallback.controler';

@Module({
  controllers: [FallbackController],
})
export class FallbackModule {}
