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
  Query,
} from '@nestjs/common';
import { CrcService } from './crc.service';
import { CreateCrcDto } from './dto/create-crc.dto';
import { UpdateCrcDto } from './dto/update-crc.dto';
import { TenantGuard } from 'src/tenant/tenant/tenant.guard';
import { AccessTokenGuard } from 'src/common/access-token/access-token.guard';

@UseGuards(TenantGuard)
@UseGuards(AccessTokenGuard)
@Controller('crc')
export class CrcController {
  constructor(private readonly crcService: CrcService) {}

  @Get('/count')
  findAll() {
    return this.crcService.findAllCRCCount();
  }

  @Get('/start')
  startSchedule(
    @Query('range') range: 'day' | 'week' | 'month' | string = 'day'
  ) {
    return this.crcService.startSchedule(range);
  }

  @Get('/budgets') 
    budgetsTotalAndOpen() {
      return this.crcService.budgetsTotalAndOpen();
    }

  @Get('/monthly-summary')
  getMonthlyEarningsAndExpenses(
    @Query('range') range = 'all'
  ) {
    return this.crcService.getMonthlyEarningsAndExpenses(range);
  }

  @Get('/transactions/performance-summary')
    getPerformanceSummary() {
      return this.crcService.getMonthlyReceivedAndPending();
    }

  @Get('/budgets/weekly-summary')
    weeklyAppointmentSummary() {
      return this.crcService.getWeeklyAppointmentSummary();
    }

  @Get('/budgets/status-summary')
    getStatusSummary(@Query('period') period: string) {
      return this.crcService.getBudgetStatusSummary(period);
    }

   @Get('/budgets/summary')
   async getSummary(@Query('period') period: 'day' | 'week' | 'month' = 'month') {
      return this.crcService.getBudgetSummary(period)
    }
  

  @Get('/missed')
  findAllSchedulesMissed() {
    return this.crcService.findAllScheduleMissed();
  }

  @Patch('missed/:id')
  async updateScheduleStatusFromKanban(
    @Param('id') id: string,
    @Body() body: { status: 'Falta' | 'Contato Realizado' | 'Agendada' },
  ) {
    return this.crcService.updateScheduleFromKanban(id, body.status);
  }

  @Get('/canceled')
  findAllSchedulesCanceled() {
    return this.crcService.findAllScheduleCanceled();
  }

  @Patch('/canceled/:id')
  updateCanceledScheduleKanban(
    @Param('id') id: string,
    @Body() body: { status: 'Desmarcado' | 'Contato Realizado' | 'Agendada' },
  ) {
    return this.crcService.updateScheduleFromCancelKanban(id, body.status);
  }
}
