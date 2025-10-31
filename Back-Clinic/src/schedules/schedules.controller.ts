/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Patch,
  Delete,
  Query,
  Sse,
} from '@nestjs/common';
import { SchedulesService } from './schedules.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { TenantGuard } from 'src/tenant/tenant/tenant.guard';
import { AccessTokenGuard } from 'src/common/access-token/access-token.guard';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { QueryDto } from 'src/schedules/dto/query.dto';
import { UpdateStatusScheduleDto } from './dto/update-status-schedule.dto';
import { UpdateDateScheduleDto } from './dto/update-date-schedule.dto';
import { TenantService } from 'src/tenant/tenant/tenant.service';
import { SseService } from './sse.service';
import { filter, map } from 'rxjs/operators';

@Controller('schedules')
export class SchedulesController {
  constructor(
    private readonly schedulesService: SchedulesService,
    private readonly sseService: SseService
  ) {}

  @UseGuards(TenantGuard)
  @UseGuards(AccessTokenGuard)
  @Get('wpptoken')
  async wpptoken(){
    return await this.schedulesService.getWhatsappCredentials();
  }

  @UseGuards(TenantGuard)
  @UseGuards(AccessTokenGuard)
  @Get('whatsapp')
  whatsappCredentials(){
    return this.schedulesService.getWhatsappCredentials();
  }


  @UseGuards(TenantGuard)
  @UseGuards(AccessTokenGuard)
  @Post()
  create(@Body() createScheduleDto: CreateScheduleDto) {
    return this.schedulesService.create(createScheduleDto);
  }

  @UseGuards(TenantGuard)
  @UseGuards(AccessTokenGuard)
  @Post(':id/return')
  async createReturn(
    @Param('id') scheduleId: string,
    @Body('startDate') startDate: Date,
    @Body('endDate') endDate: Date,
    @Body('professionalId') professionalId: string
  ) {
      return this.schedulesService.createReturn(
        scheduleId,
        startDate,
        endDate,
        professionalId
      );
}

  @UseGuards(TenantGuard)
  @UseGuards(AccessTokenGuard)
  @Get()
  findAll() {
    return this.schedulesService.findAll();
  }

  @UseGuards(TenantGuard)
  @UseGuards(AccessTokenGuard)
  @Get('/services/:days?')
  countSevices(@Param('days') days: number) {
    return this.schedulesService.countServices(days);
  }

  @UseGuards(TenantGuard)
  @UseGuards(AccessTokenGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.schedulesService.findOne(id);
  }

  @UseGuards(TenantGuard)
  @UseGuards(AccessTokenGuard)
  @Get('search/date')
  findByDate(@Query() query: QueryDto) {
    return this.schedulesService.findByDate(
      query.dateStart,
      query.dateEnd,
      query.status,
      query.professionalIds,
      query.patientName,
    );
  }

  @UseGuards(TenantGuard)
  @UseGuards(AccessTokenGuard)
  @Get('search/crc/date')
  findByCRC(@Query() query: QueryDto) {
    return this.schedulesService.findByCRC(
      query.dateStart,
      query.dateEnd,
    );
  }

  @UseGuards(TenantGuard)
  @UseGuards(AccessTokenGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateScheduleDto: UpdateScheduleDto,
  ) {
    return this.schedulesService.update(id, updateScheduleDto);
  }

  @UseGuards(TenantGuard)
  @UseGuards(AccessTokenGuard)
  @Patch('status/:id')
  updateStatus(
    @Param('id') id: string,
    @Body() updateStatusScheduleDto: UpdateStatusScheduleDto,
  ) {
    return this.schedulesService.updateStatus(id, updateStatusScheduleDto);
  }

  @UseGuards(TenantGuard)
  @UseGuards(AccessTokenGuard)
  @Sse('sse/:professionalId')
  streamNotifications(@Param('professionalId') professionalId: string) {
    return this.sseService.getNotifications().pipe(
      filter(notification => notification.professionalId === professionalId), 
      map(notification => ({ data: notification })) 
    );
  }

  @Get('askconfirm/:id')
  async askConfirm(@Param('id') id: string) {
    
    // await this.schedulesService.confirm(id);
    return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirmação de Consulta</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
          }
          .container {
            background-color: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            text-align: center;
          }
          .container h1 {
            color: #333;
          }
          .container p {
            color: #666;
          }
          .container .button-no {
            display: inline-block;
            margin-top: 20px;
            padding: 10px 20px;
            color: #fff;
            background-color: red;
            border-radius: 5px;
            text-decoration: none;
            font-weight: bold;
          }

          .container .button-yes {
            display: inline-block;
            margin-top: 20px;
            padding: 10px 20px;
            color: #fff;
            background-color: green;
            border-radius: 5px;
            text-decoration: none;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Confirmação de Consulta</h1>
          <p>Deseja confirmar sua consulta</p>
          <a href="${process.env.OWN_URL}/schedules/confirm/${id}" class="button-yes">Sim</a>
          <a href="${process.env.OWN_URL}/schedules/discard/${id}" class="button-no">Não</a>
        </div>
      </body>
    </html>
  `;
  }

  @Get('confirm/:id')
  async confirm(@Param('id') id: string) {
    await this.schedulesService.confirm(id);
    return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirmação de Consulta</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
          }
          .container {
            background-color: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            text-align: center;
          }
          .container h1 {
            color: #333;
          }
          .container p {
            color: #666;
          }
          .container .button {
            display: inline-block;
            margin-top: 20px;
            padding: 10px 20px;
            color: #fff;
            background-color: #007bff;
            border-radius: 5px;
            text-decoration: none;
            font-weight: bold;
          }
          .container .button:hover {
            background-color: #0056b3;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Confirmação de Consulta</h1>
          <p>Sua consulta foi confirmada com sucesso!</p>
        </div>
      </body>
    </html>
  `;
  }

  @Get('discard/:id')
  async discard(@Param('id') id: string) {
    await this.schedulesService.discard(id);
    return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirmação de Consulta</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
          }
          .container {
            background-color: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            text-align: center;
          }
          .container h1 {
            color: #333;
          }
          .container p {
            color: #666;
          }
          .container .button {
            display: inline-block;
            margin-top: 20px;
            padding: 10px 20px;
            color: #fff;
            background-color: #007bff;
            border-radius: 5px;
            text-decoration: none;
            font-weight: bold;
          }
          .container .button:hover {
            background-color: #0056b3;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Desmarcação de Consulta</h1>
          <p>Sua consulta foi desmarcada com sucesso!</p>
        </div>
      </body>
    </html>
  `;
  }

  @UseGuards(TenantGuard)
  @UseGuards(AccessTokenGuard)
  @Patch('date/:id')
  updateDate(
    @Param('id') id: string,
    @Body() updateDateScheduleDto: UpdateDateScheduleDto,
  ) {
    return this.schedulesService.updateDate(id, updateDateScheduleDto);
  }

  @UseGuards(TenantGuard)
  @UseGuards(AccessTokenGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.schedulesService.remove(id);
  }
}
