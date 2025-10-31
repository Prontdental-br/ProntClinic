/* eslint-disable prettier/prettier */
import { Injectable, Query, Scope } from '@nestjs/common';
import { File } from './entities/file.entity';
import { CreateFileDto } from './dto/create-file.dto';
import { TenantService } from 'src/tenant/tenant/tenant.service';
import { Clinic } from 'src/clinics/entities/clinic.entity';
import { Account } from 'src/accounts/entities/account.entity';
import { Patient } from 'src/patients/entities/patient.entity';
import { UpdateFileDto } from './dto/update-file.dto';
import { TenantModel } from 'src/common/decorators/tenant.decorators';
import { TenantModelService } from 'src/tenant/tenant/tenant.serviceModel';

@Injectable({ scope: Scope.REQUEST })
export class FileService {
  constructor(
    private tenantService: TenantService,
    private tenantModelService: TenantModelService
  ) {}

  @TenantModel(File)
  private readonly FileModel: typeof File

  @TenantModel(Patient)
  private readonly patientModel: typeof Patient

  @TenantModel(Clinic)
  private readonly clinicModel: typeof Clinic

  async findAll(patientId: string) {
    console.log('patientId', patientId);
    let file = await this.FileModel.findOne({
      where: {
        patientId,
      },
      include: [
        {
          model: this.patientModel,
          attributes: ['id', 'name', 'cellPhone'],
        },
      ],
    });

    if (file) {
      file = file.toJSON();
      const { accountId } = file;
      const clinic = (await this.clinicModel.findOne({ where: { accountId } })).toJSON();
      file['clinic'] = clinic;
    }

    return file;
  }

  async findOne(id: string) {
    let file = await this.FileModel.findOne({
      where: {
        id,
      },
      include: [
        {
          model: this.patientModel,
          attributes: ['id', 'name', 'cellPhone'],
        },
      ],
    });

    file = file.toJSON();
    const { accountId } = file;
    const clinic = (await this.clinicModel.findOne({ where: { accountId } })).toJSON();
    file['clinic'] = clinic;

    return file;
  }

  async create(FileFields) {
    let file = await this.findAll(FileFields.patientId);

    if (file) return this.update(file.id, FileFields);
    else
      file = await this.FileModel.create({
        ...FileFields,
        accountId: this.tenantService.tenant.id,
      });

    return file;
  }

  update(id: string, updateFileDto: UpdateFileDto) {
    const updated = this.FileModel.update(
      {
        ...updateFileDto,
      },
      {
        where: {
          id: id,
          accountId: this.tenantService.tenant.id,
        },
      },
    );

    if (!updated) {
      throw new Error('File not found');
    }

    return this.findOne(id);
  }

  remove(id: string) {
    return this.FileModel.destroy({
      where: {
        id: id,
        accountId: this.tenantService.tenant.id,
      },
    });
  }
}
