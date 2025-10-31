/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { StatusLogsService } from './status_logs.service';
import { CreateStatusLogDto } from './dto/create-status_log.dto';
import { UpdateStatusLogDto } from './dto/update-status_log.dto';

@Controller('status-logs')
export class StatusLogsController {
  constructor(private readonly statusLogsService: StatusLogsService) {}

  @Post()
  create(@Body() createStatusLogDto: CreateStatusLogDto) {
    return this.statusLogsService.create(createStatusLogDto);
  }

  @Get()
  findAll() {
    return this.statusLogsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.statusLogsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateStatusLogDto: UpdateStatusLogDto,
  ) {
    return this.statusLogsService.update(+id, updateStatusLogDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.statusLogsService.remove(+id);
  }
}
