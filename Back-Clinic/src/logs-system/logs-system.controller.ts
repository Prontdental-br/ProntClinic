import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { LogsSystemService } from './logs-system.service';
import { CreateLogsSystemDto } from './dto/create-logs-system.dto';
import { UpdateLogsSystemDto } from './dto/update-logs-system.dto';

@Controller('logs-system')
export class LogsSystemController {
  constructor(private readonly logsSystemService: LogsSystemService) {}

  @Post()
  create(@Body() createLogsSystemDto: CreateLogsSystemDto) {
    return this.logsSystemService.create(createLogsSystemDto);
  }

  @Get()
  findAll() {
    return this.logsSystemService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.logsSystemService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLogsSystemDto: UpdateLogsSystemDto) {
    return this.logsSystemService.update(+id, updateLogsSystemDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.logsSystemService.remove(+id);
  }
}
