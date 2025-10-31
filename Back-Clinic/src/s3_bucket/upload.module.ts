import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { MinioStorageService } from './storage.service';

@Module({
  imports: [],
  controllers: [UploadController],
  providers: [MinioStorageService],
})
export class UploadModule {}
