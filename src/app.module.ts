import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { dbProviders } from './providers/database';

@Module({
  controllers: [],
  imports: [ConfigModule.forRoot({ envFilePath: '.env', isGlobal: true })],
  providers: [...dbProviders],
})
export class AppModule {}
