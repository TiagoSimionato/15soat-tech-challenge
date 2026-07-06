import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockService } from '../../core/application/stock/stock.service';
import { StockController } from '../../frameworks/primary/controllers/stock/stock.controller';
import { Stock } from '../../frameworks/secondary/stock/stock.entity';

@Module({
  controllers: [StockController],
  imports: [TypeOrmModule.forFeature([Stock])],
  providers: [StockService],
})
export class StockModule {}
