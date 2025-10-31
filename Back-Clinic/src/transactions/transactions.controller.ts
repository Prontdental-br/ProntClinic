/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import CreateTransactionDto from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TenantGuard } from 'src/tenant/tenant/tenant.guard';
import { AccessTokenGuard } from 'src/common/access-token/access-token.guard';

@UseGuards(TenantGuard)
@UseGuards(AccessTokenGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  create(@Body() createTransactionDto: CreateTransactionDto) {
    return this.transactionsService.create(createTransactionDto);
  }

  @Get()
  findAll() {
    return this.transactionsService.findAll();
  }

  @Get('payable')
  findAllAccountsPayable() {
    return this.transactionsService.findAllAccountsPayable();
  }

  @Get('receivable')
  findAllAccountsReceivable() {
    return this.transactionsService.findAllAccountsReceivable();
  }

  @Get('/kanban')
  findAllTransactionKanban() {
    return this.transactionsService.findAllTransactionsKanban();
  }

  @Patch('/status/:id')
  async updateTransactionKanban(
    @Param('id') id: string,
    @Body() body: { status: 'in_progress' | 'won' },
  ) {
    return this.transactionsService.updateTransactionStatus(id, body.status);
  }

  @Get('patient/:id')
  patienDebts(@Param('id') id: string) {
    return this.transactionsService.getPatientTransactions(id);
  }

  @Get('debt/:id')
  async getDebt(@Param('id') id: string) {
    return await this.transactionsService.getDebt(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.transactionsService.findOne(id);
  }

  @Get('search/overdue/:days?')
  overdueDebt(@Param('days') days: number) {
    const dayValue = days ? days : 30;
    return this.transactionsService.overdueDebt(dayValue);
  }

  @Get('search/overdue/list')
  overdueDebtList() {
    return this.transactionsService.overdueDebtList();
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
  ) {
    return this.transactionsService.update(id, updateTransactionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.transactionsService.remove(id);
  }
}
