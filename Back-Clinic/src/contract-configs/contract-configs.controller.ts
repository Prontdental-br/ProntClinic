import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ContractConfigsService } from './contract-configs.service';
import { CreateContractConfigDto } from './dto/create-contract-config.dto';
import { UpdateContractConfigDto } from './dto/update-contract-config.dto';
import { TenantGuard } from 'src/tenant/tenant/tenant.guard';
import { AccessTokenGuard } from 'src/common/access-token/access-token.guard';

@UseGuards(TenantGuard)
@UseGuards(AccessTokenGuard)
@Controller('contract-configs')
export class ContractConfigsController {
  constructor(
    private readonly contractConfigsService: ContractConfigsService,
  ) {}

  @Post()
  create(@Body() createContractConfigDto: CreateContractConfigDto) {
    console.log(createContractConfigDto);

    return this.contractConfigsService.create(createContractConfigDto);
  }

  @Get()
  findAll() {
    return this.contractConfigsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.contractConfigsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateContractConfigDto: UpdateContractConfigDto,
  ) {
    return this.contractConfigsService.update(id, updateContractConfigDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.contractConfigsService.remove(id);
  }
}
