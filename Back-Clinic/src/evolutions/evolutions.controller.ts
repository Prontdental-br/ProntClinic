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
  Headers,
} from '@nestjs/common';
import { EvolutionsService } from './evolutions.service';
import { CreateEvolutionDto } from './dto/create-evolution.dto';
import { UpdateEvolutionDto } from './dto/update-evolution.dto';
import { TenantGuard } from 'src/tenant/tenant/tenant.guard';
import { AccessTokenGuard } from 'src/common/access-token/access-token.guard';
import { SendEmailEvolutionDto } from './dto/send-email-evolution.dto';

@Controller('evolutions')
export class EvolutionsController {
  constructor(private readonly evolutionsService: EvolutionsService) {}

  @UseGuards(TenantGuard)
  @UseGuards(AccessTokenGuard)
  @HttpCode(201)
  @Post()
  async create(@Body() createEvolutionDto: CreateEvolutionDto) {
    console.log(createEvolutionDto);
    return await this.evolutionsService.create(createEvolutionDto);
  }

  @UseGuards(TenantGuard)
  @UseGuards(AccessTokenGuard)
  @Get()
  findAll(@Headers() headers) {
    return this.evolutionsService.findAll(headers['patientid']);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    console.log('ID', id);
    return this.evolutionsService.findOne(id);
  }

  @UseGuards(TenantGuard)
  @UseGuards(AccessTokenGuard)
  @Post('/send/email')
  async sendEvolutionToEmail(
    @Body() SendEmailEvolutionFields: SendEmailEvolutionDto,
  ) {
    return this.evolutionsService.sendEvolutionToEmail(
      SendEmailEvolutionFields,
    );
  }

  @UseGuards(TenantGuard)
  @UseGuards(AccessTokenGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateEvolutionDto: UpdateEvolutionDto,
  ) {
    return this.evolutionsService.update(id, updateEvolutionDto);
  }
  @UseGuards(TenantGuard)
  @UseGuards(AccessTokenGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.evolutionsService.remove(id);
  }
}
