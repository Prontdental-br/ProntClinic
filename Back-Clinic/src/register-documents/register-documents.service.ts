import { Injectable, Scope, NotFoundException } from '@nestjs/common';
import { RegisterDocument } from './entities/register-document.entity';
import { CreateRegisterDocumentDto } from './dto/create-register-document.dto';
import { UpdateRegisterDocumentDto } from './dto/update-register-document.dto';
import { TenantModel } from 'src/common/decorators/tenant.decorators';
import { TenantService } from 'src/tenant/tenant/tenant.service';
import { TenantModelService } from 'src/tenant/tenant/tenant.serviceModel';

@Injectable({ scope: Scope.REQUEST })
export class RegisterDocumentsService {
  constructor(
    private tenantService: TenantService,
    private tenantModelService: TenantModelService,
  ) {}

  @TenantModel(RegisterDocument)
  private readonly registerDocumentModel: typeof RegisterDocument;

  async create(createRegisterDocumentDto: CreateRegisterDocumentDto) {
    if (!this.tenantService.tenant) {
      throw new NotFoundException('Tenant não encontrado para a requisição.');
    }
    const accountId = this.tenantService.tenant.id;

    const documentData = {
      ...createRegisterDocumentDto,
      accountId,
    };

    return this.registerDocumentModel.create(documentData);
  }

  async findAll() {
    return this.registerDocumentModel.findAll({
      where: {
        accountId: this.tenantService.tenant.id,
        active:true,
      },
    });
  }

  async findOne(id: string) {
    const document = await this.registerDocumentModel.findByPk(id);
    if (!document) {
      throw new NotFoundException(`Documento com o ID ${id} não encontrado.`);
    }
    return document;
  } 

  async update(id: string, updateRegisterDocumentDto: UpdateRegisterDocumentDto) {
    const document = await this.registerDocumentModel.findByPk(id);

    if (!document) {
      throw new NotFoundException(`Documento com o ID ${id} não encontrado.`);
    }

    const documentData = {
      ...updateRegisterDocumentDto,
      userUpdated: this.tenantService.tenant.id,
    };

    await document.update(documentData);
    return document;
  }

  async remove(id: string) {
    const document = await this.registerDocumentModel.findByPk(id);

    if (!document || document.accountId !== this.tenantService.tenant.id) {
      throw new NotFoundException(`Documento com o ID ${id} não encontrado.`);
    }
    await document.update({ active: false });

    return { message: 'Documento desativado com sucesso.' };
  }
}
