// File.controller.ts
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
import { File } from './entities/file.entity';
import { FileService } from './files.service';
import { CreateFileDto } from './dto/create-file.dto';
import { TenantGuard } from 'src/tenant/tenant/tenant.guard';
import { AccessTokenGuard } from 'src/common/access-token/access-token.guard';

@Controller('file')
export class FileController {
  constructor(private readonly FileService: FileService) {}

  @UseGuards(TenantGuard)
  @UseGuards(AccessTokenGuard)
  @Get(':id')
  findOne(@Param('id') id: string): Promise<File> {
    return this.FileService.findOne(id);
  }

  @UseGuards(TenantGuard)
  @UseGuards(AccessTokenGuard)
  @Get(':patientId?')
  async findAll(@Query('patientId') patientId: string): Promise<File> {
    console.log('patientId', patientId);
    return this.FileService.findAll(patientId);
  }

  @UseGuards(TenantGuard)
  @UseGuards(AccessTokenGuard)
  @Post()
  async create(@Body() FileFields: CreateFileDto): Promise<File> {
    console.log(FileFields);
    return this.FileService.create(FileFields);
  }

  @UseGuards(TenantGuard)
  @UseGuards(AccessTokenGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.FileService.remove(id);
  }
}
