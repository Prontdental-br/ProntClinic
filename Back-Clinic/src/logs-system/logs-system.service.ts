import { Injectable } from '@nestjs/common';
import { CreateLogsSystemDto } from './dto/create-logs-system.dto';
import { UpdateLogsSystemDto } from './dto/update-logs-system.dto';

@Injectable()
export class LogsSystemService {
  create(createLogsSystemDto: CreateLogsSystemDto) {
    return 'This action adds a new logsSystem';
  }

  findAll() {
    return `This action returns all logsSystem`;
  }

  findOne(id: number) {
    return `This action returns a #${id} logsSystem`;
  }

  update(id: number, updateLogsSystemDto: UpdateLogsSystemDto) {
    return `This action updates a #${id} logsSystem`;
  }

  remove(id: number) {
    return `This action removes a #${id} logsSystem`;
  }
}
