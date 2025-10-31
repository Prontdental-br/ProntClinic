import { Module } from '@nestjs/common';
import { LogsSystemService } from './logs-system.service';
import { LogsSystemController } from './logs-system.controller';

@Module({
  controllers: [LogsSystemController],
  providers: [LogsSystemService]
})
export class LogsSystemModule {}
