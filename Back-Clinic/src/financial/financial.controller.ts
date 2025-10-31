import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { FinancialService } from './financial.service';
import { TenantGuard } from 'src/tenant/tenant/tenant.guard';
import { AccessTokenGuard } from 'src/common/access-token/access-token.guard';
import { Financials } from './entities/financial.entity';
import { CreateFinancialDto } from './dto/create-financial.dto';

@Controller('financial')
export class FinancialController {
  constructor(private readonly FinancialService: FinancialService) {}

  @UseGuards(TenantGuard)
  @UseGuards(AccessTokenGuard)
  @Get()
  async findAll(): Promise<Financials[]> {
    return this.FinancialService.findAll();
  }

  @UseGuards(TenantGuard)
  @UseGuards(AccessTokenGuard)
  @Post()
  async create(@Body() fields: CreateFinancialDto): Promise<Financials> {
    return this.FinancialService.create(fields);
  }
}
