import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { RegisterDocumentsService } from './register-documents.service';
import { CreateRegisterDocumentDto } from './dto/create-register-document.dto';
import { UpdateRegisterDocumentDto } from './dto/update-register-document.dto';
import { AccessTokenGuard } from 'src/common/access-token/access-token.guard';
import { TenantGuard } from 'src/tenant/tenant/tenant.guard';
import { RegisterDocument } from './entities/register-document.entity';

@UseGuards(TenantGuard)
@UseGuards(AccessTokenGuard)
@Controller('register-documents')
export class RegisterDocumentsController {
  constructor(private readonly registerDocumentsService: RegisterDocumentsService) {}

  @Post()
  create(@Body() createRegisterDocumentDto: CreateRegisterDocumentDto): Promise<RegisterDocument> {
    return this.registerDocumentsService.create(createRegisterDocumentDto);
  }

  @Get()
  async findAll(): Promise<RegisterDocument[]> {
    return this.registerDocumentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.registerDocumentsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRegisterDocumentDto: UpdateRegisterDocumentDto) {
    return this.registerDocumentsService.update(id, updateRegisterDocumentDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.registerDocumentsService.remove(id);
  }
}
