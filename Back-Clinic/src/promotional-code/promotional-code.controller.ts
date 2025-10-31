import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PromotionalCodeService } from './promotional-code.service';
import { CreatePromotionalCodeDto } from './dto/create-promotional-code.dto';
import { UpdatePromotionalCodeDto } from './dto/update-promotional-code.dto';

@Controller('promotional-code')
export class PromotionalCodeController {
  constructor(
    private readonly promotionalCodeService: PromotionalCodeService
  ) {}

  // @Post()
  // create(@Body() createPromotionalCodeDto: CreatePromotionalCodeDto) {
  //   return this.promotionalCodeService.create(createPromotionalCodeDto);
  // }

  // @Get()
  // findAll() {
  //   return this.promotionalCodeService.findAll();
  // }

  @Get(':name')
  findOne(@Param('name') name: string) {
    return this.promotionalCodeService.findByName(name);
  }

  // @Patch(':id')
  // update(
  //   @Param('id') id: string, 
  //   @Body() 
  //   updatePromotionalCodeDto: UpdatePromotionalCodeDto
  // ) {
  //   return this.promotionalCodeService.update(+id, updatePromotionalCodeDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.promotionalCodeService.remove(+id);
  // }
}
