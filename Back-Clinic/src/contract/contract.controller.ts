/* eslint-disable prettier/prettier */
// Contract.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Contract } from './entities/contract.entity';
import { ContractService } from './contract.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { TenantGuard } from 'src/tenant/tenant/tenant.guard';
import { AccessTokenGuard } from 'src/common/access-token/access-token.guard';
import { SendEmailContractDto } from './dto/send-email-contract.dto';

@Controller('contract')
export class ContractController {
  constructor(private readonly ContractService: ContractService) {}

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Contract> {
    return this.ContractService.findOne(id);
  }

  @UseGuards(TenantGuard)
  @UseGuards(AccessTokenGuard)
  @Get(':patientId?')
  async findAll(@Query('patientId') patientId: string): Promise<Contract[]> {
    console.log('patientId', patientId);
    return this.ContractService.findAll(patientId);
  }

  @UseGuards(TenantGuard)
  @UseGuards(AccessTokenGuard)
  @Post()
  async create(@Body() ContractFields: CreateContractDto): Promise<Contract> {
    console.log(ContractFields);
    return this.ContractService.create(ContractFields);
  }

  @UseGuards(TenantGuard)
  @UseGuards(AccessTokenGuard)
  @Post('/send/email')
  async sendContractToEmail(@Body() SendEmailContractFields: SendEmailContractDto): Promise<Contract> {
    return this.ContractService.sendContractToEmail(SendEmailContractFields);
  }

  @UseGuards(TenantGuard)
  @UseGuards(AccessTokenGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ContractService.remove(id);
  }
}
