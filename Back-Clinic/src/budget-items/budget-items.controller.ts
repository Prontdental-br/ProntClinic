import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { BudgetItemsService } from './budget-items.service';
import { CreateBudgetItemDto } from './dto/create-budget-item.dto';
import { UpdateBudgetItemDto } from './dto/update-budget-item.dto';
import { AccessTokenGuard } from 'src/common/access-token/access-token.guard';
import { TenantGuard } from 'src/tenant/tenant/tenant.guard';

@UseGuards(TenantGuard)
@UseGuards(AccessTokenGuard)
@Controller('budget-items')
export class BudgetItemsController {
  constructor(private readonly budgetItemsService: BudgetItemsService) {}

  @Post()
  create(@Body() createBudgetItemDto: CreateBudgetItemDto) {
    return this.budgetItemsService.create(createBudgetItemDto);
  }

  @Get('/totalbytreatment/:days?')
  totalByTreatment(@Param('days') days: number) {
    return this.budgetItemsService.totalByTreatment(days);
  }

  @Get('/totalbyspecialty/')
  totalBySpecialty() {
    return this.budgetItemsService.totalBySpecialty();
  }

  @Get(':budgetId?')
  findAll(
    @Query('budgetId') budgetId: string,
    @Query('patientId') patientId: string,
  ) {
    return this.budgetItemsService.findAll(budgetId, patientId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.budgetItemsService.findOne(id);
  }

  @Get('search/open-budget/:days?')
  overdueDebt(@Param('days') days: number) {
    const dayValue = days ? days : 30;
    return this.budgetItemsService.openBudget(dayValue);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateBudgetItemDto: UpdateBudgetItemDto,
  ) {
    return this.budgetItemsService.update(id, updateBudgetItemDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    console.log(id)
    return this.budgetItemsService.remove(id);
  }

}
