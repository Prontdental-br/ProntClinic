import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from 'src/common/access-token/access-token.guard';
import { TenantGuard } from 'src/tenant/tenant/tenant.guard';
import { TaxesService } from './taxes.service';
import CreateTax from './dto/create-tax';
import BulkCreateTaxes from './dto/bulk-create-taxes';

@Controller('taxes')
@UseGuards(TenantGuard)
@UseGuards(AccessTokenGuard)
export class TaxesController {
  constructor(private readonly taxesService: TaxesService) {}

  @Post()
  create(@Body() createTax: CreateTax) {
    return this.taxesService.create(createTax);
  }

  @Post('bulk')
  createBulk(@Body() createTax: BulkCreateTaxes) {
    return this.taxesService.bulkCreate(createTax);
  }

  @Get()
  findAll() {
    return this.taxesService.findAll();
  }
}
