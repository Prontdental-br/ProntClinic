/* eslint-disable prettier/prettier */
import {
  Controller,
  Post,
  Get,
  Body,
  UsePipes,
  ValidationPipe,
  UseGuards,
  Res,
  Param,
  Query,
  Delete,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import * as moment from 'moment';
import { CreateReportDto } from './dto/create-report';
import { TenantGuard } from 'src/tenant/tenant/tenant.guard';
import { AccessTokenGuard } from 'src/common/access-token/access-token.guard';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @UseGuards(TenantGuard)
  @UseGuards(AccessTokenGuard)
  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(@Body() body: CreateReportDto, @Res() res) {
    await this.reportsService.create(body, res);
  }

  // @UseGuards(TenantGuard)
  // @UseGuards(AccessTokenGuard)
  @Get('download/:id')
  async download(@Res() res, @Param('id') id: string) {
    await this.reportsService.download(res, id);
  }

  @UseGuards(TenantGuard)
  @UseGuards(AccessTokenGuard)
  @Get('generate')
  async report(@Query() query) {
    let startDate = moment().startOf('day').subtract(3, 'hours').toDate();

    if (query.startDate) {
      startDate = moment(query.startDate).toDate();
    }
    let endDate = moment().endOf('day').subtract(3, 'hours').toDate();
    if (query.endDate) {
      endDate = moment(query.endDate).toDate();
    }

    const data = await this.reportsService.getReport(startDate, endDate);
    return data;
  }

  @UseGuards(TenantGuard)
  @UseGuards(AccessTokenGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.reportsService.remove(id);
  }

  @UseGuards(TenantGuard)
  @UseGuards(AccessTokenGuard)
  @Get('generate/download')
  async downloadReport(@Res() res, @Query() query) {
    let startDate = moment().startOf('day').toDate();
    if (query.startDate) {
      startDate = moment(query.startDate).toDate();
    }
    let endDate = moment().startOf('day').toDate();
    if (query.endDate) {
      endDate = moment(query.endDate).toDate();
    }
    const data = await this.reportsService.getReport(startDate, endDate);
    await this.reportsService.downloadReport(res, [
      {
        ...data.budgets,
        ...data.schedule,
        ...data.transaction,
      },
    ]);
    // return buffer;
  }

  @UseGuards(TenantGuard)
  @UseGuards(AccessTokenGuard)
  @Get()
  async findAll() {
    return await this.reportsService.findAll();
  }
}
