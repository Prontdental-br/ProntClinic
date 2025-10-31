import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ReturnListService } from './return-list.service';
import { CreateReturnListDto } from './dto/create-return-list.dto';
import { UpdateReturnListDto } from './dto/update-return-list.dto';
import { TenantGuard } from 'src/tenant/tenant/tenant.guard';
import { AccessTokenGuard } from 'src/common/access-token/access-token.guard';

@UseGuards(TenantGuard)
@UseGuards(AccessTokenGuard)
@Controller('return-list')
export class ReturnListController {
  constructor(private readonly returnListService: ReturnListService) {}

  @Post()
  create(@Body() createReturnListDto: CreateReturnListDto) {
    return this.returnListService.create(createReturnListDto);
  }

  @Get('pending')
  findAllPending() {
    return this.returnListService.findAllPending();
  }

  @Get()
  findAll(@Query('periodo') periodo: string) {
    return this.returnListService.findAll(periodo);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.returnListService.findOne(id);
  }

  @Patch(':id/confirm')
  confirm(@Param('id') id: string) {
    return this.returnListService.updateStatus(id, 'confirmed');
  }

  @Patch(':id/lost')
  lost(@Param('id') id: string) {
    return this.returnListService.updateStatus(id, 'lost');
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateReturnListDto: UpdateReturnListDto,
  ) {
    return this.returnListService.update(id, updateReturnListDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.returnListService.remove(id);
  }
}
