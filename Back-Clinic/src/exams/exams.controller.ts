// Exams.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Exams } from './entities/exams.entity';
import { ExamsService } from './exams.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { TenantGuard } from 'src/tenant/tenant/tenant.guard';
import { AccessTokenGuard } from 'src/common/access-token/access-token.guard';

@Controller('exams')
export class ExamsController {
  constructor(private readonly ExamsService: ExamsService) {}

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Exams> {
    return this.ExamsService.findOne(id);
  }

  @UseGuards(TenantGuard)
  @UseGuards(AccessTokenGuard)
  @Get(':patientId?')
  async findAll(@Query('patientId') patientId: string): Promise<Exams[]> {
    console.log('patientId', patientId);
    return this.ExamsService.findAll(patientId);
  }

  @UseGuards(TenantGuard)
  @UseGuards(AccessTokenGuard)
  @Post()
  async create(@Body() ExamsFields: CreateExamDto): Promise<Exams> {
    console.log(ExamsFields);
    return this.ExamsService.create(ExamsFields);
  }

  @UseGuards(TenantGuard)
  @UseGuards(AccessTokenGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ExamsService.remove(id);
  }
}
