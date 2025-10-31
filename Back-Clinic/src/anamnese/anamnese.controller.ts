/* eslint-disable prettier/prettier */
// Anamnese.controller.ts
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
import { Anamnese } from './entities/anamnese.entity';
import { AnamneseService } from './anamnese.service';
import { CreateAnamneseDto } from './dto/create-anamnese.dto';
import { TenantGuard } from 'src/tenant/tenant/tenant.guard';
import { AccessTokenGuard } from 'src/common/access-token/access-token.guard';
import { SendEmailAnamneseDto } from './dto/send-email-anamnese.dto';
import { CreateAnamneseConfigDto } from './dto/creat-anamense-config.dto';
import { CreateAnamneseItemDto } from './dto/create-anamnese-config-item.dto';
import { UpdateAnamneseItemDto } from './dto/updated-anamnese-config-tem.dto';

@Controller('anamnese')
export class AnamneseController {
  constructor(private readonly AnamneseService: AnamneseService) {}

  @UseGuards(TenantGuard)
  @UseGuards(AccessTokenGuard)
  @Post('send/email')
  async sendAnamneseByEmail(
    @Body() sendEmailAnamneseFields: SendEmailAnamneseDto,
  ): Promise<Anamnese> {
    return this.AnamneseService.sendAnamneseByEmail(sendEmailAnamneseFields);
  }

  @UseGuards(TenantGuard)
  @UseGuards(AccessTokenGuard)
  @Post()
  async create(@Body() AnamneseFields: CreateAnamneseDto): Promise<Anamnese> {
    console.log(AnamneseFields);
    return this.AnamneseService.create(AnamneseFields);
  }

  @UseGuards(TenantGuard)
  @UseGuards(AccessTokenGuard)
  @Get('config')
  async getConfig() {
    return this.AnamneseService.getConfig();
  }

  @UseGuards(TenantGuard)
  @UseGuards(AccessTokenGuard)
  @Post('config')
  async createConfig(@Body() body: CreateAnamneseConfigDto) {
    return this.AnamneseService.createConfig(body);
  }

  @Patch('question/:id')
  async updateAnamnese(@Param('id') id: string, @Body('items') items: any[]) {
    return this.AnamneseService.updateAnamnese(id, items);
  }

  @UseGuards(TenantGuard)
  @UseGuards(AccessTokenGuard)
  @Post('config/:id/items')
  async addQuestionConfig(
    @Param('id') configId: string,
    @Body() data: CreateAnamneseItemDto,
  ) {
    return this.AnamneseService.addQuestionConfig(configId, data);
  }

  @UseGuards(TenantGuard)
  @UseGuards(AccessTokenGuard)
  @Patch('config/items/:id')
  async updatePergunta(
    @Param('id') itemId: string,
    @Body() data: UpdateAnamneseItemDto,
  ) {
    return this.AnamneseService.updateQuestionConfig(itemId, data);
  }

  @UseGuards(TenantGuard)
  @UseGuards(AccessTokenGuard)
  @Delete('config/items/:id')
  async deleteQuestion(@Param('id') id: string) {
    return this.AnamneseService.deleteQuestionConfig(id);
  }

  @UseGuards(TenantGuard)
  @UseGuards(AccessTokenGuard)
  @Patch('config/:id')
  async editConfigName(@Param('id') id: string, @Body('desc') desc: string) {
    return this.AnamneseService.editConfigName(id, desc);
  }

  @UseGuards(TenantGuard)
  @UseGuards(AccessTokenGuard)
  @Delete('config/:id')
  async deleteConfig(@Param('id') id: string) {
    return this.AnamneseService.deleteConfig(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Anamnese> {
    return this.AnamneseService.findOne(id);
  }

  @UseGuards(TenantGuard)
  @UseGuards(AccessTokenGuard)
  @Get(':patientId?')
  async findAll(@Query('patientId') patientId: string): Promise<Anamnese[]> {
    console.log('patientId', patientId);
    return this.AnamneseService.findAll(patientId);
  }

  @UseGuards(TenantGuard)
  @UseGuards(AccessTokenGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.AnamneseService.remove(id);
  }
}
