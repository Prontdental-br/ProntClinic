/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { CreateScoreDto } from './dto/create-score-plans.dto';
import { UpdateScoreDto } from './dto/update-score-plans.dto';
import { AccessTokenGuard } from 'src/common/access-token/access-token.guard';
import { ScoreService } from './score-plans.service';

@UseGuards(AccessTokenGuard)
@Controller('score-plans')
export class ScoreController {
  constructor(
    private readonly scoreService: ScoreService,
  ) {}

  @Post()
  async create(@Body() createScoreDto: CreateScoreDto) {
      return this.scoreService.create(createScoreDto);
  }

  @Get()
  async findAll() {
      return this.scoreService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
      return this.scoreService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateScoreDto: UpdateScoreDto) {
      return this.scoreService.update(id, updateScoreDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
      await this.scoreService.remove(id);
  }

  @Post('consultation')
  async getScoreConsultation(@Body() body: { id: string; document: string; patientId: string, accountId: string }) {
    const { id, document, patientId, accountId } = body;
    return this.scoreService.getScoreConsultation({ id, document, patientId, accountId });
  }

  @Post('payment')
  async createPayment(@Body() body: { accountId: string; planId: string }) {
    const { accountId, planId } = body;
 
    return this.scoreService.createPayment({ accountId, planId });
  }
}
