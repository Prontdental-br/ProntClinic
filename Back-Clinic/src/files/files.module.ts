import { Module } from '@nestjs/common';
import { FileService } from './files.service';
import { FileController } from './files.controller';
import { File } from './entities/file.entity';
import { SequelizeModule } from '@nestjs/sequelize';
import { TenantModelService } from 'src/tenant/tenant/tenant.serviceModel';

@Module({
  imports: [SequelizeModule.forFeature([File])],
  controllers: [FileController],
  providers: [FileService, TenantModelService],
})
export class FilesModule {}
