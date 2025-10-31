/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Delete, Param, Body, Patch, UseGuards } from '@nestjs/common';
import { ContractSignatureService } from './contractSignature.service';
import { CreateContractSignatureDto } from './dto/create-contractSignature.dto';
import { AccessTokenGuard } from 'src/common/access-token/access-token.guard';
import { TenantGuard } from 'src/tenant/tenant/tenant.guard';

@Controller('contracts-signature') 
export class ContractSignatureController {
  constructor(private readonly contractSignatureService: ContractSignatureService) {}

  @UseGuards(TenantGuard)
  @UseGuards(AccessTokenGuard)
  @Post()
  async create(@Body() createContractSignatureDto: CreateContractSignatureDto) {
    return this.contractSignatureService.createContract(createContractSignatureDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string)  {
    return this.contractSignatureService.findContractById(id);
  }

  @Get("docId/:id")
  async findContractByDocId(@Param('id') id: string) {
    return this.contractSignatureService.findContractByDocId(id);
  }

  @Patch(':id/:idSigner')
  async update(
    @Param('id') id: string,
    @Param('idSigner') idSigner: string,
  ) {
    return this.contractSignatureService.updateContract(id, idSigner);
  }

  @UseGuards(TenantGuard)
  @UseGuards(AccessTokenGuard)
  @Get("findAllContracts/:id")
  async findAllContracts(@Param('id') id: string) {
      return this.contractSignatureService.findAllContracts(id);
  }

  @UseGuards(TenantGuard)
  @UseGuards(AccessTokenGuard)
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<number> {
    return this.contractSignatureService.deleteContract(id);
  }
}
