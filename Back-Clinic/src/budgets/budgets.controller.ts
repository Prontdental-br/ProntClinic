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
  BadRequestException,
  InternalServerErrorException,
  Query,
} from '@nestjs/common';
import { BudgetsService } from './budgets.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { AccessTokenGuard } from 'src/common/access-token/access-token.guard';
import { TenantGuard } from 'src/tenant/tenant/tenant.guard';
import { AdminProfessionalGuard } from 'src/tenant/tenant/admin.professional';
import { QueryDto } from 'src/schedules/dto/query.dto';
import { SendEmailBudgetDto } from './dto/send-email-budget.dto';
import { StatusEnum } from './entities/budget.entity';

@Controller('budgets')
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @UseGuards(TenantGuard)
  @UseGuards(AccessTokenGuard)
  @Post()
  create(@Body() createBudgetDto: CreateBudgetDto) {
    return this.budgetsService.create(createBudgetDto);
  }

  @UseGuards(AdminProfessionalGuard)
  @UseGuards(TenantGuard)
  @UseGuards(AccessTokenGuard)
  @Get()
  findAll(@Query('limit') limit: number, @Query('offset') offset: number) {
    return this.budgetsService.findAll(limit, offset);
  }

  @UseGuards(AdminProfessionalGuard)
  @UseGuards(TenantGuard)
  @UseGuards(AccessTokenGuard)
  @Get('/sales')
  findBudgetsSales() {
    return this.budgetsService.findBudgetsSales();
  }

  @UseGuards(AdminProfessionalGuard)
  @UseGuards(TenantGuard)
  @UseGuards(AccessTokenGuard)
  @Get('/open/:days?')
  listOpenBudget(@Param('days') days: number) {
    return this.budgetsService.listOpenBudget(days);
  }

  @UseGuards(AdminProfessionalGuard)
  @UseGuards(TenantGuard)
  @UseGuards(AccessTokenGuard)
  @Get('/graphbarsqt/:years?')
  graphBarsQt(@Param('years') years: number) {
    return this.budgetsService.graphBarsQt(years);
  }

  @UseGuards(AdminProfessionalGuard)
  @UseGuards(TenantGuard)
  @UseGuards(AccessTokenGuard)
  @Get('/graphbarsvalue/:years?')
  graphBarsValue(@Param('years') years: number) {
    return this.budgetsService.graphBarsValue(years);
  }

  @UseGuards(TenantGuard)
  @UseGuards(AccessTokenGuard)
  @Get('/totalbyprofessional/:days?')
  totalByProfessional(@Param('days') days: number) {
    return this.budgetsService.totalByProfessional(days);
  }

  @UseGuards(TenantGuard)
  @UseGuards(AccessTokenGuard)
  @Get('/totalbyplan/:days?')
  totalByPlan(@Param('days') days: number) {
    return this.budgetsService.totalByPlan(days);
  }

  @UseGuards(TenantGuard)
  @UseGuards(AccessTokenGuard)
  @Get('/totalall/:days?')
  totalAll(@Param('days') days: number) {
    return this.budgetsService.totalAll(days);
  }

  @UseGuards(TenantGuard)
  @UseGuards(AccessTokenGuard)
  @Get('/totalallbydate/:days?')
  totalAllByDate(@Query() query: QueryDto) {
    return this.budgetsService.totalAllByDate(query.dateStart, query.dateEnd);
  }

  @UseGuards(TenantGuard)
  @UseGuards(AccessTokenGuard)
  @Get('/totalallopen/:days?')
  totalAllOpen(@Param('days') days: number) {
    return this.budgetsService.totalAllOpen(days);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    console.log(id);
    return this.budgetsService.findOne(id);
  }

  @UseGuards(TenantGuard)
  @UseGuards(AccessTokenGuard)
  @Get('/patient/:id')
  findByPatient(
    @Param('id') patientId: string,
    @Query('limit') limit: number,
    @Query('offset') offset: number,
  ) {
    return this.budgetsService
      .findByPatientId(patientId, limit, offset)
      .catch((error) => {
        if (error instanceof InternalServerErrorException) {
          throw error;
        } else {
          throw new BadRequestException(error.message);
        }
      });
  }

  @UseGuards(TenantGuard)
  @UseGuards(AccessTokenGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBudgetDto: UpdateBudgetDto) {
    return this.budgetsService.update(id, updateBudgetDto);
  }

  @UseGuards(TenantGuard)
  @UseGuards(AccessTokenGuard)
  @Patch('status/:id')
async updateStatus(
  @Param('id') id: string,
  @Body('status') status: StatusEnum,
) {
  return this.budgetsService.updateStatus(id, status);
}

    @UseGuards(TenantGuard)
    @UseGuards(AccessTokenGuard)
    @Post('/send/email')
    async sendBudgetToEmail(@Body() SendEmailBudgetFields: SendEmailBudgetDto) {
      return this.budgetsService.sendBudgetToEmail(SendEmailBudgetFields);
    }

  @UseGuards(TenantGuard)
  @UseGuards(AccessTokenGuard)
  @Post('addpayment/:id')
  addPayment(@Param('id') id: string, @Body() paymentField) {
    return this.budgetsService.addPayment(id, paymentField);
  }

  @UseGuards(TenantGuard)
  @UseGuards(AccessTokenGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.budgetsService.remove(id);
  }

  @UseGuards(TenantGuard)
  @UseGuards(AccessTokenGuard)
  @Post('/double/:id')
  double(@Param('id') id: string) {
    return this.budgetsService.double(id);
  }

  @UseGuards(TenantGuard)
  @UseGuards(AccessTokenGuard)
  @Get('search/open-budget/:days?')
  overdueDebt(@Param('days') days: number) {
    const dayValue = days ? days : 30;
    return this.budgetsService.openBudget(dayValue);
  }
}
