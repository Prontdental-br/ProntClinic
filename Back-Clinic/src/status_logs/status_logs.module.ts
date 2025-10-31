import { Module } from '@nestjs/common';
import { StatusLogsService } from './status_logs.service';
import { StatusLogsController } from './status_logs.controller';

@Module({
  controllers: [StatusLogsController],
  providers: [StatusLogsService]
})
export class StatusLogsModule {}
