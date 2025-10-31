import {
  Controller,
  Post,
  Patch,
  Get,
  UseGuards,
  Param,
  Delete,
  Body,
} from '@nestjs/common';
import { SpecialtyService } from './specialty.service';
import { CreateSpecialtyDto } from './dto/create-specialty.dto';
import { UpdateSpecialtyDto } from './dto/update-specialty.dto';
import { AccessTokenGuard } from 'src/common/access-token/access-token.guard';
import { TenantGuard } from 'src/tenant/tenant/tenant.guard';

@UseGuards(TenantGuard)
@UseGuards(AccessTokenGuard)
@Controller('specialty')
export class SpecialtyController {
  constructor(private readonly specialtyService: SpecialtyService) {}

  @Post()
  create(@Body() createSpecialtyDto: CreateSpecialtyDto) {
    return this.specialtyService.create(createSpecialtyDto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSpecialtyDto: UpdateSpecialtyDto,
  ) {
    return this.specialtyService.update(id, updateSpecialtyDto);
  }

  @Get()
  findAll() {
    return this.specialtyService.findAll();
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.specialtyService.remove(id);
  }
}
