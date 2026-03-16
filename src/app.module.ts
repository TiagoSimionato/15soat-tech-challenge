import { Module } from '@nestjs/common';
import { dbProviders } from './providers/database';

@Module({
  controllers: [],
  imports: [],
  providers: [...dbProviders],
})
export class AppModule {}
