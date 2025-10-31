/* eslint-disable prettier/prettier */
import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    NotFoundException,
    HttpCode,
    HttpStatus,
    UseGuards
  } from '@nestjs/common';


import { CreateScoreConsultationDto } from './dto/create-score-consult.dto';
import { UpdateScoreConsultationDto } from './dto/update-score-consult.dto';
import { ScoreConsultationService } from './score-consult.service';
import { TenantGuard } from 'src/tenant/tenant/tenant.guard';
import { AccessTokenGuard } from 'src/common/access-token/access-token.guard';
  
  @UseGuards(TenantGuard)
  @UseGuards(AccessTokenGuard)
  @Controller('score-consultations')
  export class ScoreConsultationController {
    constructor(
      private readonly scoreConsultationService: ScoreConsultationService
    ) {}
  
    @Post()
    async create(@Body() createScoreConsultationDto: CreateScoreConsultationDto) {
      return this.scoreConsultationService.create(createScoreConsultationDto);
    }
  
    @Get('/all/:id')
    async findAll(@Param('id') id: string) {
      return this.scoreConsultationService.findAll(id);
    }
  
    @Get(':id')
    async findOne(@Param('id') id: string) {
      const consultation = await this.scoreConsultationService.findOne(id);
      if (!consultation) {
        throw new NotFoundException(`Consulta de score com ID ${id} não encontrada`);
      }
      return consultation;
    }
  
    @Patch(':id')
    async update(
      @Param('id') id: string,
      @Body() updateScoreConsultationDto: UpdateScoreConsultationDto
    ) {
      return this.scoreConsultationService.update(id, updateScoreConsultationDto);
    }
  
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id') id: string) {
      return this.scoreConsultationService.remove(id);
    }
  }
  