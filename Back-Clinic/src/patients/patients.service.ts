/* eslint-disable prettier/prettier */
import { Inject, Injectable, Scope } from '@nestjs/common';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { InjectModel } from '@nestjs/sequelize';
import { GenderEnum, Patient } from './entities/patient.entity';
import { TenantService } from 'src/tenant/tenant/tenant.service';
import { Op, Optional } from 'sequelize';
import { Schedule } from 'src/schedules/entities/schedule.entity';

import { PatientsExcel } from './interfaces/patients-excel.interface';
import { BulkCreatePatientDto } from './dto/bulk-create-patient.dto';
import { excelDateToJSDate, readExcelData } from 'src/common/excel';
import { formatCellphone, formatCPF, formatRG } from 'src/common/formatters';
import { Sequelize } from 'sequelize-typescript';
import { TenantModel } from 'src/common/decorators/tenant.decorators';
import { TenantModelService } from 'src/tenant/tenant/tenant.serviceModel';
import { isValid, parseISO } from 'date-fns';

@Injectable({ scope: Scope.REQUEST })
export class PatientsService {
  constructor(
    @Inject(Sequelize) private readonly sequelize: Sequelize,
    private tenantService: TenantService,
    private readonly tenantModelService: TenantModelService,
  ) {}

  @TenantModel(Patient)
  private readonly patientModel: typeof Patient;

  create(createPatientDto: CreatePatientDto) {
    return this.patientModel.create({
      ...createPatientDto,
      accountId: this.tenantService.tenant.id,
    });
  }

  async bulkCreate(patients: BulkCreatePatientDto[]) {
    await this.patientModel.bulkCreate(patients as any);
  }

  findAll(query: string) {
    return this.patientModel.findAll({
      where: {
        active: 1,
        accountId: this.tenantService.tenant.id,
        ...(query && {
          [Op.and]: Sequelize.where(
            Sequelize.fn('unaccent', Sequelize.col('name')),
            {
              [Op.iLike]: `%${query}%`,
            },
          ),
        }),
      },
      order: [[Sequelize.fn('unaccent', Sequelize.col('name')), 'ASC']], // alfabetical
    });
  }

  findOne(id: string) {
    return this.patientModel.findOne({
      where: {
        id,
        active: 1,
        accountId: this.tenantService.tenant.id,
      },
      rejectOnEmpty: true,
    });
  }

  async countPatients() {
    let birthday = 0;

    const patients = await this.patientModel.findAll({
      where: {
        active: 1,
        accountId: this.tenantService.tenant.id,
      },
      raw: true,
    });

    const birthdayPeople = [];

    patients.forEach((p: any) => {
      if (p.birthDate) {
        const [ano, mes, dia] = p.birthDate.split('-').map(Number);
        const currMonth = new Date().getMonth() + 1;
        const currDay = new Date().getDate();
        if (mes === currMonth && currDay === dia) {
          birthday++;
          birthdayPeople.push(p);
        }
      }
    });

    return { countPatient: patients.length, birthday, birthdayPeople };
  }

  async getBirthdays() {
    const patients = await this.patientModel.findAll({
      where: {
        active: 1,
        accountId: this.tenantService.tenant.id,
        birthDate: {
          [Op.not]: null,
        },
      },
    });

    return patients.filter((p) => {
      try {
        const date =
          typeof p.birthDate === 'string'
            ? parseISO(p.birthDate)
            : new Date(p.birthDate);

        return isValid(date);
      } catch {
        return false;
      }
    });
  }

  update(id: string, updatePatientDto: UpdatePatientDto) {
    return this.patientModel.update(
      {
        ...updatePatientDto,
      },
      {
        where: {
          id: id,
          accountId: this.tenantService.tenant.id,
        },
      },
    );
  }

  async remove(id: string) {
    // const transaction = await this.sequelize.transaction();

    // const budget = await Budget.findAll({
    //   where: {
    //     patientId: id
    //   },
    //   // transaction
    // })

    // console.log(budget);

    // await Payment.destroy({
    //   where: {
    //     budgetId: budget.id
    //   },
    //   transaction
    // })

    // await Budget.destroy({
    //   where: {
    //     patientId: id,
    //   },
    //   // transaction
    // });

    await Schedule.destroy({
      where: {
        patientId: id,
      },
      // transaction
    });

    // await transaction.commit();
    await this.patientModel.update(
      { active: 0 },
      {
        where: {
          id: id,
          accountId: this.tenantService.tenant.id,
        },
      },
    );
  }

  async importExcelData(file: Express.Multer.File) {
    const patientsData = readExcelData<PatientsExcel>(file.buffer);
    const accountId = this.tenantService.tenant.id;
    if (patientsData.length === 0) {
      return;
    }
    const data: BulkCreatePatientDto[] = [];
    for (let index = 0; index < patientsData.length; index += 1) {
      const currentItem = patientsData[index];
      const dto = new BulkCreatePatientDto();
      dto.accountId = accountId;
      dto.email = currentItem['Email do Paciente'] ?? '';
      dto.responsibleRg = '';
      dto.avatar = null;
      dto.birthDate = currentItem['Data de Nascimento do Paciente']
        ? excelDateToJSDate(
            currentItem['Data de Nascimento do Paciente'],
          ).toLocaleDateString('en-CA', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          })
        : '';
      dto.cellPhone = currentItem['Telefone do Paciente']
        ? formatCellphone(`${currentItem['Telefone do Paciente']}`)
        : '';
      dto.city = currentItem['Cidade'] ?? '';
      dto.cpf = currentItem['CPF do Paciente']
        ? formatCPF(`${currentItem['CPF do Paciente']}`)
        : '';
      dto.planType = '';
      switch (currentItem['Gênero do Paciente']) {
        case 'Masculino':
          dto.gender = GenderEnum.Male;
          break;
        case 'Feminino':
          dto.gender = GenderEnum.Female;
          break;
        default:
          dto.gender = GenderEnum.Other;
          break;
      }
      dto.name = currentItem['Nome do Paciente'] ?? '';
      dto.neighborhood = currentItem['Bairro'] ?? '';
      dto.observation = currentItem['Observação'] ?? '';
      dto.responsibleBirthDate = currentItem[
        'Data de Nascimento do Responsável'
      ]
        ? excelDateToJSDate(
            currentItem['Data de Nascimento do Responsável'],
          ).toLocaleDateString('en-CA', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          })
        : '';
      dto.responsibleCellPhone = currentItem['Celular do Responsável']
        ? formatCellphone(`${currentItem['Celular do Responsável']}`)
        : '';
      dto.responsibleCpf = currentItem['CPF do Responsável']
        ? formatCPF(`${currentItem['CPF do Responsável']}`)
        : '';
      dto.responsibleName = currentItem['Nome do Responsável'] ?? '';
      dto.rg = currentItem['RG do Paciente']
        ? formatRG(`${currentItem['RG do Paciente']}`)
        : '';
      dto.state = currentItem['Estado'] ?? '';
      dto.street = currentItem['Rua'] ?? '';
      dto.zipCode = currentItem['CEP'] ?? '';
      data.push(dto);
    }
    await this.bulkCreate(data);
  }
}
