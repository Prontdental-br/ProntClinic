import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { QuotePlanService } from './quote-plan.service';
import { CreateQuotePlanDto } from './dto/create-quote-plan.dto';
import { UpdateQuotePlanDto } from './dto/update-quote-plan.dto';

@Controller('quote-plan')
export class QuotePlanController {
  constructor(private readonly quotePlanService: QuotePlanService) {}

  @Post()
  create(@Body() createQuotePlanDto: CreateQuotePlanDto) {
    return this.quotePlanService.create(createQuotePlanDto);
  }

  @Get()
  findAll() {
    return this.quotePlanService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.quotePlanService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateQuotePlanDto: UpdateQuotePlanDto) {
    return this.quotePlanService.update(+id, updateQuotePlanDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.quotePlanService.remove(+id);
  }
}
