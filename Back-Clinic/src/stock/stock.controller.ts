// stock.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { Stock } from './entities/stock.entity';
import { StockService } from './stock.service';
import { CreateStockDto } from './dto/create-stock.dto';
import { TenantGuard } from 'src/tenant/tenant/tenant.guard';
import { AccessTokenGuard } from 'src/common/access-token/access-token.guard';
import { WithdrawalStockDto } from './dto/withdrawal-stock.dto';

@UseGuards(TenantGuard)
@UseGuards(AccessTokenGuard)
@Controller('stocks')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Get()
  async findAll(): Promise<Stock[]> {
    return this.stockService.findAll();
  }

  @Post()
  async create(@Body() stockFields: CreateStockDto): Promise<Stock> {
    console.log(stockFields);
    return this.stockService.create(stockFields);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() stockFields: CreateStockDto): Promise<number> {
      const [affectedCount] = await this.stockService.update(id, stockFields);
      return affectedCount; 
  } 

  @Post('/withdrawal')
  async withdrawal(@Body() params: WithdrawalStockDto) {
    this.stockService.withdrawal(params);
  }

  @Post('/add')
  async add(@Body() params: WithdrawalStockDto) {
    this.stockService.add(params);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.stockService.remove(id);
  }
}
