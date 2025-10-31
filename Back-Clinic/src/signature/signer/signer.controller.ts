/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { SignerService } from './signer.service';
import { Signer } from './entities/signer.entity';
import { CreateSignerDto } from './dto/create-signer.dto';


@Controller('signers') 
export class SignerController {
  constructor(private readonly signerService: SignerService) {}

  @Post('/:documentId')
  async createSigner(
    @Param('documentId') documentId: string, 
    @Body() createSignerDto: CreateSignerDto,
  ) {
    return this.signerService.createSignerAndUpdateContract(createSignerDto, documentId);
  }

  @Get()
  async findAll(): Promise<Signer[]> {
    return this.signerService.findAllSigners();
  }

  @Get(':documentId')
  async findOne(@Param('id') id: string): Promise<Signer> {
    return this.signerService.findSignerById(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateSignerDto: Partial<Signer>,
  ): Promise<[number, Signer[]]> {
    return this.signerService.updateSigner(id, updateSignerDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<number> {
    return this.signerService.deleteSigner(id);
  }
}
