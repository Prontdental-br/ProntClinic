import { Injectable } from '@nestjs/common';
import { CreateStatusLogDto } from './dto/create-status_log.dto';
import { UpdateStatusLogDto } from './dto/update-status_log.dto';

@Injectable()
export class StatusLogsService {
  create(createStatusLogDto: CreateStatusLogDto) {
    return 'This action adds a new statusLog';
  }

  findAll() {
    return `This action returns all statusLogs`;
  }

  findOne(id: number) {
    return `This action returns a #${id} statusLog`;
  }

  update(id: number, updateStatusLogDto: UpdateStatusLogDto) {
    return `This action updates a #${id} statusLog`;
  }

  remove(id: number) {
    return `This action removes a #${id} statusLog`;
  }
}
