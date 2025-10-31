// Labs.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Labs } from './entities/labs.entity';
import { LabsService } from './labs.service';
import { CreateLabDto } from './dto/create-lab.dto';
import { TenantGuard } from 'src/tenant/tenant/tenant.guard';
import { AccessTokenGuard } from 'src/common/access-token/access-token.guard';

@Controller('labs')
export class LabsController {
  constructor(private readonly LabsService: LabsService) {}

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Labs> {
    return this.LabsService.findOne(id);
  }

  @UseGuards(TenantGuard)
  @UseGuards(AccessTokenGuard)
  @Get()
  async findAll(): Promise<Labs[]> {
    return this.LabsService.findAll();
  }

  @UseGuards(TenantGuard)
  @UseGuards(AccessTokenGuard)
  @Post()
  async create(@Body() LabsFields: CreateLabDto): Promise<Labs> {
    return this.LabsService.create(LabsFields);
  }

  @UseGuards(TenantGuard)
  @UseGuards(AccessTokenGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() LabsFields: CreateLabDto,
  ): Promise<Labs> {
    return this.LabsService.update(id, LabsFields);
  }

  @UseGuards(TenantGuard)
  @UseGuards(AccessTokenGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.LabsService.remove(id);
  }
}
