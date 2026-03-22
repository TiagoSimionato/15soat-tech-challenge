import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockController } from './controllers/stock.controller';
import { Stock } from './entities/stock.entity';
import { StockService } from './services/stock.service';

@Module({
  controllers: [StockController],
  imports: [TypeOrmModule.forFeature([Stock])],
  providers: [StockService],
})
export class StockModule {}
