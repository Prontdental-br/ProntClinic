/* eslint-disable prettier/prettier */
import { BadRequestException, Injectable, NotFoundException, Scope } from "@nestjs/common";
import { DigitalCertificate } from "./entities/digital-certificate.entity";
import { CreateDigitalCertificateDto } from "./dto/create-digital-certificate.dto";
import * as argon2 from 'argon2';
import { TenantService } from "src/tenant/tenant/tenant.service";
import { CryptoUtils } from "src/utils/cryptoUtils";
import { TenantModel } from "src/common/decorators/tenant.decorators";
import { TenantModelService } from "src/tenant/tenant/tenant.serviceModel";
import { SchemasReference } from "src/schemas_references/entities/schemas_reference.entity";

@Injectable({ scope: Scope.REQUEST })
export class DigitalCertificateService {
    constructor(
        private tenantService: TenantService,
        private tenantModelService: TenantModelService
    ) {}

    @TenantModel(DigitalCertificate)
    private readonly digitalCertificateModel: typeof DigitalCertificate
  
  async uploadCertificate(file: Express.Multer.File, createCertificateDto: CreateDigitalCertificateDto) {
    if (!file || !createCertificateDto.password) {
      throw new BadRequestException('Certificado e senha são obrigatórios.');
    }

    const existingCert = await this.digitalCertificateModel.findOne({ where: { professionalId: createCertificateDto.professionalId } });
    if (existingCert) {
      throw new BadRequestException('Este profissional já possui um certificado cadastrado.');
    }

    const encryptedPassword = CryptoUtils.encrypt(createCertificateDto.password);

    const newCert = await this.digitalCertificateModel.create({
      professionalId: createCertificateDto.professionalId,
      certificateFile: file.buffer, 
      accountId: this.tenantService.tenant.id,
      password: encryptedPassword , 
    });

    await SchemasReference.create({
      id_reference: createCertificateDto.professionalId,
      id_schema: this.tenantService.tenant.idSeq,
      accountId: this.tenantService.tenant.id,
      type: 'digital-certificate',
    });

    return { message: 'Certificado salvo com sucesso!', id: newCert.id };
  }

  async getCertificate(professionalId: string) {

    const existingCert = await SchemasReference.findOne({
      where: { id_reference: professionalId, type: 'digital-certificate' },
    });

    console.log('existingCert', existingCert);

    const schemaName = `${process.env.NAME_SCHEMA_CLIENT}${existingCert.id_schema}`;

    const DigitalCertificateM = DigitalCertificate.schema(schemaName);

    const cert = await DigitalCertificateM.findOne({ where: { professionalId } });

    if (!cert) {
      throw new NotFoundException('Certificado não encontrado para este profissional.');
    }

    const decryptedPassword = CryptoUtils.decrypt(cert.password);

    return {
      id: cert.id,
      professionalId: cert.professionalId,
      certificateFile: cert.certificateFile,
      password: decryptedPassword, 
    };
  }

  async findById(professionalId: string) {
    //  const existingCert = await SchemasReference.findOne({
    //   where: { id_reference: professionalId, type: 'digital-certificate' },
    // });

    // console.log('existingCert', existingCert);

    // const schemaName = `${process.env.NAME_SCHEMA_CLIENT}${existingCert.id_schema}`;

    // const DigitalCertificateM = DigitalCertificate.schema(schemaName);

    const cert = await this.digitalCertificateModel.findOne({ where: { professionalId } });

    if (!cert) {
      throw new NotFoundException('Certificado não encontrado para este profissional.');
    }

    // const decryptedPassword = CryptoUtils.decrypt(cert.password);

    return {
      id: cert.id,
      professionalId: cert.professionalId,
      // password: decryptedPassword, 
    };
  }

  async verifyPassword(professionalId: string, password: string): Promise<void> {
    const cert = await this.getCertificate(professionalId);

    const isValid = await argon2.verify(cert.password, password);
    if (!isValid) {
      throw new BadRequestException('Senha incorreta.');
    }
  }

  async deleteCertificate(professionalId: string) {
    const cert = await this.digitalCertificateModel.findOne({ where: { professionalId } });

    if (!cert) {
      throw new BadRequestException('Certificado não encontrado para este profissional.');
    }

    await cert.destroy();
    return { message: '✅ Certificado excluído com sucesso!' };
  }
}
