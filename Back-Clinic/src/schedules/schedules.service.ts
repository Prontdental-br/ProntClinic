/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException, Scope } from '@nestjs/common';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Schedule, StatusEnum } from './entities/schedule.entity';
import { TenantService } from 'src/tenant/tenant/tenant.service';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { Op } from 'sequelize';
import { Patient } from 'src/patients/entities/patient.entity';
import { ScheduleTag } from './entities/schedule.tag.entity';
import { Sequelize } from 'sequelize-typescript';
import { Tag } from 'src/tags/entities/tag.entity';
import { Professional } from 'src/professionals/entities/professional.entity';
import { UpdateStatusScheduleDto } from './dto/update-status-schedule.dto';
import { UpdateDateScheduleDto } from './dto/update-date-schedule.dto';
import * as moment from 'moment';
import { User } from 'src/users/entities/user.entity';
import axios from 'axios';
import { Clinic } from 'src/clinics/entities/clinic.entity';
import * as dayjs from 'dayjs';
import { SettingsService } from 'src/settings/settings.service';
import { WhatsappService } from 'src/whatsapp/whatsapp.service';
import { SseService } from './sse.service';
import { TenantModelService } from 'src/tenant/tenant/tenant.serviceModel';
import { TenantModel } from 'src/common/decorators/tenant.decorators';
import { SchemasReference } from 'src/schemas_references/entities/schemas_reference.entity';
import { StatusLog } from 'src/status_logs/entities/status_log.entity';
import { BudgetItem } from 'src/budget-items/entities/budget-item.entity';
import { TreatmentsModule } from 'src/treatments/treatments.module';
import { Treatment } from 'src/treatments/entities/treatment.entity';
import { ReturnList } from 'src/return-list/entities/return-list.entity';

const returnDays: any = {
  '0': 0,
  '5': 15,
  '6': 30,
  '1': 30,
  '7': 60,
  '8': 90,
  '9': 120,
  '10': 150,
  '2': 180,
  '11': 210,
  '12': 240,
  '13': 270,
  '14': 300,
  '15': 330,
  '3': 360,
};

export interface WhatsappToken {
  number: string;
  token: string;
  url: string;
  status?: boolean;
}

function get24HoursBefore(dateString) {
  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    throw new Error('Data inválida');
  }

  date.setTime(date.getTime() - 24 * 60 * 60 * 1000);

  return date;
}

function getDaysAfter(dateString, days, hours) {
  const date = new Date(dateString);
  hours = hours ? new Date(hours) : new Date();

  if (isNaN(date.getTime())) {
    throw new Error('Data inválida');
  }

  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  date.setHours(hours.getHours());
  date.setMinutes(hours.getMinutes());

  return date;
}

function getDaysAfterWithOneHour(dateString, days, hours) {
  const date = new Date(dateString);
  hours = hours ? new Date(hours) : new Date();

  if (isNaN(date.getTime())) {
    throw new Error('Data inválida');
  }

  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000 + 60 * 60 * 1000);
  date.setHours(hours.getHours());
  date.setMinutes(hours.getMinutes());

  console.log(date);

  return date;
}

function adicionarDias(dataString, dias) {
  // Converte a string de data para um objeto Date
  const data = new Date(dataString);

  // Adiciona o número de dias
  data.setDate(data.getDate() + dias);

  // Formata a data de volta para o formato YYYY-MM-DD
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');

  return `${ano}-${mes}-${dia}`;
}

export const WHATSAPP_LAST_TOKEN_KEY = 'whatsapp_last_token';
export const WHATSAPP_TOKENS_KEY = 'whatsapp_tokens';
export const WHATSAPP_COUNT_SENDS_KEY = 'whatsapp_count_sends_key';
export const WHATSAPP_MAX_SENDS = 2;
export const MAX_RETRIES = 4;

@Injectable({ scope: Scope.REQUEST })
export class SchedulesService {
  constructor(
    private sequelize: Sequelize,
    private tenantService: TenantService,
    private readonly tenantModelService: TenantModelService,
    private settingsService: SettingsService,
    private whatsappService: WhatsappService,
    private sseService: SseService,
  ) {}

  @TenantModel(Schedule)
  private readonly scheduleModel: typeof Schedule;

  @TenantModel(ScheduleTag)
  private readonly scheduleTagModel: typeof ScheduleTag;

  @TenantModel(Clinic)
  private readonly clinicModel: typeof Clinic;

  @TenantModel(Patient)
  private readonly patientModel: typeof Patient;

  @TenantModel(Professional)
  private readonly professionalModel: typeof Professional;

  @TenantModel(Tag)
  private readonly tagModel: typeof Tag;

  @TenantModel(StatusLog)
  private readonly statusLogModel: typeof StatusLog;

  @TenantModel(BudgetItem)
  private readonly budgetItemModel: typeof BudgetItem;

  @TenantModel(Treatment)
  private readonly treatmentModel: typeof Treatment;

  @TenantModel(ReturnList)
  private readonly returnListModel: typeof ReturnList;

  async create(createScheduleDto: CreateScheduleDto) {
    try {
      const atomic = await this.sequelize.transaction();
      try {
        const schedule = await this.scheduleModel.create(
          {
            ...createScheduleDto,
            accountId: this.tenantService.tenant.id,
          },
          {
            transaction: atomic,
          },
        );

        let schedule2;
        if (createScheduleDto.returnIn !== 0)
          schedule2 = await this.scheduleModel.create(
            {
              ...createScheduleDto,
              startDate: getDaysAfter(
                createScheduleDto.startDate,
                returnDays[createScheduleDto.returnIn],
                createScheduleDto.returnTime,
              ),
              endDate: getDaysAfterWithOneHour(
                createScheduleDto.startDate,
                returnDays[createScheduleDto.returnIn],
                createScheduleDto.returnTime,
              ),
              returnIn: 0,
              accountId: this.tenantService.tenant.id,
            },
            {
              transaction: atomic,
            },
          );

        const patient = await this.patientModel.findByPk(
          createScheduleDto.patientId,
        );
        const professional = await this.professionalModel.findByPk(
          createScheduleDto.professionalId,
        );

        const clinic = await this.clinicModel.findOne({
          where: { accountId: professional.accountId },
        });

        if (
          createScheduleDto.confirmMessage &&
          createScheduleDto.saveConfirmMessage
        )
          await User.update(
            {
              scheduleMessageText: createScheduleDto.confirmMessage,
              activeNotificationSound:
                createScheduleDto.activeNotificationSound,
              activateReminder: createScheduleDto.activateReminder,
            },
            {
              where: {
                id: this.tenantService.userTenant.id,
                accountId: this.tenantService.tenant.id,
              },
            },
          );

        await User.update(
          {
            activeScheduleMessage:
              createScheduleDto.activeConfirmMessage || false,
            activeNotificationSound: createScheduleDto.activeNotificationSound,
            activateReminder: createScheduleDto.activateReminder,
          },
          {
            where: {
              id: this.tenantService.userTenant.id,
              accountId: this.tenantService.tenant.id,
            },
          },
        );

        if (createScheduleDto.treatmentId && createScheduleDto.return) {
          const [value, type] = createScheduleDto.return.split('-');

          const payload = {
            treatmentId: createScheduleDto.treatmentId,
            startDate: createScheduleDto.startDate,
            returnValue: Number(value),
            returnType: type as 'D' | 'M',
            patientId: createScheduleDto.patientId,
            status: 'pending',
          };

          await this.returnListModel.create(
            {
              ...payload,
              accountId: this.tenantService.tenant.id,
              userCreated: this.tenantService.userTenant.id,
            },
            { transaction: atomic },
          );
        }

        const endereco = `${clinic.street} ${clinic.addressNumber} ${clinic.neighborhood} ${clinic.city} ${clinic.state} ${clinic.addressComplement} ${clinic.cep}`;

        if (createScheduleDto.confirmMessage) {
          createScheduleDto.confirmMessage =
            createScheduleDto.confirmMessage.replace(
              '%PACIENTE%',
              patient.name,
            );
          createScheduleDto.confirmMessage =
            createScheduleDto.confirmMessage.replace(
              '%MEDICO%',
              professional.name,
            );
          createScheduleDto.confirmMessage =
            createScheduleDto.confirmMessage.replace(
              '%DIA%',
              dayjs(createScheduleDto.startDate)?.format?.('DD/MM/YYYY'),
            );
          createScheduleDto.confirmMessage =
            createScheduleDto.confirmMessage.replace(
              '%PACIENTE%',
              patient.name,
            );
          createScheduleDto.confirmMessage =
            createScheduleDto.confirmMessage.replace(
              '%HORA%',
              dayjs(createScheduleDto.startDate)?.format?.('HH:mm'),
            );

          createScheduleDto.confirmMessage =
            createScheduleDto.confirmMessage.replace('%CLINICA%', clinic.name);

          createScheduleDto.confirmMessage =
            createScheduleDto.confirmMessage.replace('%ENDERECO%', endereco);

          createScheduleDto.confirmMessage =
            createScheduleDto.confirmMessage.replace(
              '%LINK%',
              `${process.env.OWN_URL}/schedules/askconfirm/${schedule.id}`,
            );

          createScheduleDto.confirmMessage =
            createScheduleDto.confirmMessage.replace(
              '%FONE%',
              this.tenantService.tenant.cellPhone,
            );
        }

        const greetingMessage = `Olá ${
          patient.name
        }, está agendada sua consulta com ${professional.name}
Data: ${dayjs(createScheduleDto.startDate)?.format?.('DD/MM/YYYY')}  
Horário: ${dayjs(createScheduleDto.startDate)?.format?.('HH:mm')} 

Até breve.
`;

        if (createScheduleDto.activeConfirmMessage)
          this.waMessage(
            createScheduleDto,
            patient,
            greetingMessage,
            createScheduleDto.activateReminder,
          );

        await atomic.commit();

        if (createScheduleDto.tags) {
          await Promise.all(
            createScheduleDto.tags.map(async (tag) => {
              if (tag && tag != '') {
                console.log(tag, schedule.id);
                this.scheduleTagModel.create({
                  scheduleId: schedule.id,
                  tagId: tag,
                });
              }
            }),
          );
        }

        await SchemasReference.create({
          accountId: this.tenantService.tenant.id,
          id_reference: schedule.id,
          id_schema: this.tenantService.tenant.idSeq,
          type: 'schedule',
        });

        await this.statusLogModel.create({
          accountId: this.tenantService.tenant.id,
          entityId: schedule.id,
          type: 'schedule',
          status: schedule.status,
        });

        return schedule;
      } catch (error) {
        console.error(error);
        await atomic.rollback();
      }
    } catch (e) {
      console.log(e);
    }
  }

  async createReturn(
    scheduleId: string,
    startDate: Date,
    endDate: Date,
    professionalId: string,
  ) {
    try {
      const atomic = await this.sequelize.transaction();
      try {
        const originalSchedule = await this.scheduleModel.findByPk(scheduleId);

        if (!originalSchedule) {
          throw new NotFoundException('Agendamento não encontrado.');
        }

        const returnSchedule = await this.scheduleModel.create(
          {
            startDate,
            endDate,
            returnIn: 0,
            accountId: originalSchedule.accountId,
            patientId: originalSchedule.patientId,
            professionalId: professionalId,
            type: originalSchedule.type,
            duration: originalSchedule.duration,
            observation: originalSchedule.observation,
            confirmMessage: originalSchedule.confirmMessage,
            isConfirmed: originalSchedule.isConfirmed,
            isAllDay: originalSchedule.isAllDay,
            status: 'SC',
          },
          { transaction: atomic },
        );

        const professional = await this.professionalModel.findByPk(
          returnSchedule.professionalId,
        );

        const patient = await this.patientModel.findByPk(
          returnSchedule.patientId,
        );

        const clinic = await this.clinicModel.findOne({
          where: { accountId: professional.accountId },
        });

        const endereco = `${clinic.street} ${clinic.addressNumber} ${clinic.neighborhood} ${clinic.city} ${clinic.state} ${clinic.addressComplement} ${clinic.cep}`;

        if (returnSchedule.confirmMessage) {
          returnSchedule.confirmMessage = returnSchedule.confirmMessage.replace(
            '%PACIENTE%',
            patient.name,
          );
          returnSchedule.confirmMessage = returnSchedule.confirmMessage.replace(
            '%MEDICO%',
            professional.name,
          );
          returnSchedule.confirmMessage = returnSchedule.confirmMessage.replace(
            '%DIA%',
            dayjs(startDate)?.format?.('DD/MM/YYYY'),
          );
          returnSchedule.confirmMessage = returnSchedule.confirmMessage.replace(
            '%PACIENTE%',
            patient.name,
          );
          returnSchedule.confirmMessage = returnSchedule.confirmMessage.replace(
            '%HORA%',
            dayjs(startDate)?.format?.('HH:mm'),
          );

          returnSchedule.confirmMessage = returnSchedule.confirmMessage.replace(
            '%CLINICA%',
            clinic.name,
          );

          returnSchedule.confirmMessage = returnSchedule.confirmMessage.replace(
            '%ENDERECO%',
            endereco,
          );

          returnSchedule.confirmMessage = returnSchedule.confirmMessage.replace(
            '%LINK%',
            `${process.env.OWN_URL}/schedules/askconfirm/${returnSchedule.id}`,
          );

          returnSchedule.confirmMessage = returnSchedule.confirmMessage.replace(
            '%FONE%',
            this.tenantService.tenant.cellPhone,
          );
        }

        const greetingMessage = `Olá ${
          patient.name
        }, sua consulta de retorno está agendada com ${professional.name}
Data: ${dayjs(startDate)?.format?.('DD/MM/YYYY')}  
Horário: ${dayjs(startDate)?.format?.('HH:mm')} 

Até breve.
`;

        this.waMessage(returnSchedule, patient, greetingMessage, false);

        await SchemasReference.create({
          accountId: this.tenantService.tenant.id,
          id_reference: returnSchedule.id,
          id_schema: this.tenantService.tenant.idSeq,
          type: 'schedule',
        });

        await atomic.commit();
        return returnSchedule;
      } catch (error) {
        console.error(error);
        await atomic.rollback();
      }
    } catch (e) {
      console.log(e);
    }
  }

  async findAll() {
    const professional = await this.professionalModel.findOne({
      where: { userId: this.tenantService.userTenant.id },
      raw: true,
    });

    const schedules = await this.scheduleModel.findAll({
      where: {
        accountId: this.tenantService.tenant.id,
        ...(professional && { professionalId: professional.id }),
      },
      include: [
        {
          model: this.patientModel,
          attributes: ['id', 'name'],
        },
      ],
      raw: false,
    });

    const scheduleIds = schedules.map((s) => s.id);

    const statusLogs = await this.statusLogModel.findAll({
      where: {
        accountId: this.tenantService.tenant.id,
        entityId: scheduleIds,
        type: 'waiting-list',
        status: 'AP',
      },
      attributes: ['entityId', 'createdAt'],
      raw: true,
    });

    const statusLogMap = new Map<string, Date>();
    statusLogs.forEach((log) => {
      statusLogMap.set(log.entityId, log.createdAt);
    });

    const result = schedules.map((schedule) => {
      const scheduleJson = schedule.toJSON();
      return {
        ...scheduleJson,
        waitingCreatedAt: statusLogMap.get(schedule.id) || null,
      };
    });

    return result;
  }

  async countServices(days?: number) {
    const daylimit = moment(new Date()).subtract(days, 'days').startOf('day');

    console.log(daylimit.toDate());

    const countServices = await this.scheduleModel.count({
      where: {
        accountId: this.tenantService.tenant.id,
        status: 'AT',
        ...(days && {
          created_at: {
            [Op.gt]: daylimit,
          },
        }),
      },
    });

    return { countServices };
  }

  async findOne(id: string) {
    const professional = await this.professionalModel.findOne({
      where: { userId: this.tenantService.userTenant.id },
      raw: true,
    });
    return this.scheduleModel.findOne({
      where: {
        id,
        accountId: this.tenantService.tenant.id,
        ...(professional && { professionalId: professional?.id }),
      },
      include: [
        {
          model: this.patientModel,
          attributes: ['name', 'cell_phone', 'plan_type'],
        },
        {
          model: this.scheduleTagModel,
          attributes: [],
        },
      ],
      rejectOnEmpty: true,
    });
  }

  async findAllByDate(startDate: Date, endDate: Date) {
    const schedules = await this.scheduleModel.findAll({
      where: {
        account_id: this.tenantService.tenant.id,
        startDate: {
          [Op.between]: [startDate, endDate],
        },
      },
    });
    return schedules;
  }

  async findByDate(
    startDate: Date,
    endDate: Date,
    status?: string,
    professionalIds?: string,
    name?: string,
  ) {
    const user = await User.findOne({
      where: { id: this.tenantService.userTenant.id },
      raw: true,
    });

    const professional = await this.professionalModel.findOne({
      where: { email: user.email },
      raw: true,
    });

    const statusArr = status ? status?.split(',') : undefined;
    const professionalArr = professionalIds
      ? professionalIds?.split(',')
      : undefined;

    const whereClause: any = {
      account_id: this.tenantService.tenant.id,
      ...(name && {
        [Op.and]: Sequelize.where(
          Sequelize.fn('unaccent', Sequelize.col('patient.name')),
          {
            [Op.iLike]: `%${name}%`,
          },
        ),
      }),
      ...(statusArr && {
        status: {
          [Op.in]: statusArr,
        },
      }),
      ...(professionalArr && {
        professionalId: {
          [Op.in]: professionalArr,
        },
      }),
    };

    if (startDate && endDate) {
      whereClause.startDate = {
        [Op.between]: [startDate, endDate],
      };
    }

    let schedules = await this.scheduleModel.findAll({
      where: whereClause,
      include: [
        {
          model: this.patientModel,
          attributes: [
            'name',
            'cell_phone',
            'plan_type',
            'next_consultation_forecast',
          ],
        },
        {
          model: this.professionalModel,
          attributes: [
            'id',
            'name',
            'isPrivate',
            'userId',
            'accountId',
            'email',
          ],
        },
        {
          model: this.scheduleTagModel,
          include: [
            {
              model: this.tagModel,
              attributes: ['name', 'color'],
            },
          ],
        },
      ],
    });

    schedules = JSON.parse(JSON.stringify(schedules));
    if (
      professional &&
      !professional.isAdmin &&
      professional.specialty !== 'recepcionista'
    ) {
      schedules = schedules.filter((s: any) => {
        return s.professional.email === user.email;
      });
    } else if (professional && professional.specialty !== 'recepcionista') {
      schedules = schedules.filter((s: any) => {
        const prof = s.professional;

        return (
          !prof?.isPrivate ||
          (prof?.isPrivate && prof.email === user.email) ||
          (prof?.isPrivate && professional.isAdmin)
        );
      });
    }

    const scheduleIds = schedules.map((s: any) => s.id);

    const statusLogs = await this.statusLogModel.findAll({
      where: {
        accountId: this.tenantService.tenant.id,
        entityId: scheduleIds,
        status: 'AP',
        type: 'waiting-list',
      },
      attributes: ['entityId', 'createdAt'],
      raw: true,
    });

    const statusLogMap = new Map<string, Date>();
    statusLogs.forEach((log) => {
      statusLogMap.set(log.entityId, log.createdAt);
    });

    schedules = schedules.map((schedule: any) => ({
      ...schedule,
      waitingCreatedAt: statusLogMap.get(schedule.id) || null,
    }));

    const treatmentIds = schedules
      .map((s: any) => s.treatmentId)
      .filter((id: string) => !!id);

    let treatments = [];
    if (treatmentIds.length > 0) {
      treatments = await this.budgetItemModel.findAll({
        where: {
          id: { [Op.in]: treatmentIds },
          accountId: this.tenantService.tenant.id,
        },
        include: [
          {
            model: this.treatmentModel,
            attributes: ['id', 'name', 'value', 'specialtyId', 'description'],
          },
        ],
        raw: true,
      });
    }

    const treatmentMap = new Map<string, any>();
    treatments.forEach((t) => {
      treatmentMap.set(t.id, t);
    });

    console.log(treatmentMap);

    schedules = schedules.map((schedule: any) => {
      const treatment = schedule.treatmentId
        ? treatmentMap.get(schedule.treatmentId)
        : null;

      return {
        ...schedule,
        waitingCreatedAt: statusLogMap.get(schedule.id) || null,
        treatmentId: schedule.treatmentId,
        treatmentSession: treatment ? treatment.session : null,
        treatmentSessionDone: treatment ? treatment.sessionDone : null,
        treatmentStatus: treatment ? treatment.status : null,
        treatmentName: treatment ? treatment?.['treatment.name'] : null,
      };
    });

    return schedules;
  }

  async findByCRC(startDate: Date, endDate: Date) {
    return this.scheduleModel.findAll({
      where: {
        accountId: this.tenantService.tenant.id,
        // startDate: {
        //   [Op.between]: [startDate, endDate],
        // },
      },
      include: [
        {
          model: this.patientModel,
          attributes: ['name', 'cell_phone', 'plan_type'],
        },
        {
          model: this.professionalModel,
          attributes: [
            'id',
            'name',
            'isPrivate',
            'userId',
            'accountId',
            'email',
          ],
        },
        {
          model: this.scheduleTagModel,
          include: [
            {
              model: this.tagModel,
              attributes: ['name', 'color'],
            },
          ],
        },
      ],
    });
  }

  async confirm(id: string) {
    const schemaReference = await SchemasReference.findOne({
      where: {
        id_reference: id,
        type: 'schedule',
      },
    });

    if (!schemaReference) {
      throw new NotFoundException('Agendamento não encontrado');
    }

    const schemaName = `${process.env.NAME_SCHEMA_CLIENT}${schemaReference.id_schema}`;

    const ScheduleModel = Schedule.schema(schemaName);

    return ScheduleModel.update(
      {
        status: 'CF',
      },
      {
        where: {
          id: id,
        },
      },
    );
  }

  async discard(id: string) {
    const schemaReference = await SchemasReference.findOne({
      where: {
        id_reference: id,
        type: 'schedule',
      },
    });

    if (!schemaReference) {
      throw new NotFoundException('Agendamento não encontrado');
    }

    const schemaName = `${process.env.NAME_SCHEMA_CLIENT}${schemaReference.id_schema}`;

    const ScheduleModel = Schedule.schema(schemaName);

    return ScheduleModel.update(
      {
        status: 'CP',
      },
      {
        where: {
          id: id,
        },
      },
    );
  }

  async update(id: string, updateScheduleDto: UpdateScheduleDto) {
    const atomic = await this.sequelize.transaction();
    try {
      if (updateScheduleDto.tags) {
        await this.scheduleTagModel.destroy({
          where: { scheduleId: id },
        });

        for (const tag of updateScheduleDto.tags) {
          if (tag && tag !== '') {
            await this.scheduleTagModel.create({ scheduleId: id, tagId: tag });
          }
        }
      }

      const scheduleUpdated = this.scheduleModel.update(
        {
          ...updateScheduleDto,
        },
        {
          where: {
            id: id,
            accountId: this.tenantService.tenant.id,
          },
        },
      );

      const updatedSchedule = await this.scheduleModel.findOne({
        where: { id },
        include: [
          {
            model: this.patientModel,
            attributes: ['name', 'next_consultation_forecast'],
          },
          { model: this.scheduleTagModel },
          { model: this.professionalModel, attributes: ['name'] },
        ],
      });

      if (
        updateScheduleDto.status &&
        updateScheduleDto.status !== updatedSchedule.status
      ) {
        await this.statusLogModel.create({
          accountId: this.tenantService.tenant.id,
          entityId: id,
          type: 'schedule',
          status: updateScheduleDto.status,
        });
      }

      await atomic.commit();

      if (updateScheduleDto.status === StatusEnum.ArrivedPatient) {
        let tagName = 'Sem rótulo';

        if (updateScheduleDto.tags && updateScheduleDto.tags[0]) {
          const tag = await this.tagModel.findOne({
            where: { id: updateScheduleDto.tags[0] },
          });

          if (tag) {
            tagName = tag.name;
          }
        }

        await this.statusLogModel.create({
          accountId: this.tenantService.tenant.id,
          entityId: id,
          type: 'waiting-list',
          status: updateScheduleDto.status,
        });

        const notification = {
          professionalId: updatedSchedule.professionalId,
          patientName: updatedSchedule.patient.name,
          patientId: updatedSchedule.patientId,
          professionalName: updatedSchedule.professional.name,
          nextConsultationForecast:
            updatedSchedule.patient.nextConsultationForecast,
          time: updatedSchedule.startDate,
          tag: tagName,
          id: updatedSchedule.id,
        };

        this.sseService.sendNotification(notification);
      }

      if (updateScheduleDto.status === StatusEnum.Attended) {
        if (updatedSchedule.treatmentId) {
          const budgetItem = await this.budgetItemModel.findOne({
            where: {
              id: updatedSchedule.treatmentId,
              accountId: this.tenantService.tenant.id,
            },
          });

          if (budgetItem) {
            const currentDone = budgetItem.sessionDone || 0;

            if (!budgetItem.session || budgetItem.session <= 0) {
              await this.budgetItemModel.update(
                { status: 'done' },
                { where: { id: budgetItem.id } },
              );
            } else {
              if (currentDone < budgetItem.session) {
                const newSessionDone = currentDone + 1;

                await this.budgetItemModel.update(
                  {
                    sessionDone: newSessionDone,
                    ...(newSessionDone >= budgetItem.session
                      ? { status: 'done' }
                      : {}),
                  },
                  {
                    where: { id: budgetItem.id },
                  },
                );
              }
            }
          }
        }
      }

      return scheduleUpdated;
    } catch (error) {
      await atomic.rollback();
      console.error(error);
    }
  }

  async updateStatus(
    id: string,
    updateStatusScheduleDto: UpdateStatusScheduleDto,
  ) {
    const currentSchedule = await this.scheduleModel.findOne({
      where: {
        id: id,
        accountId: this.tenantService.tenant.id,
      },
      include: [
        {
          model: this.patientModel,
          attributes: ['name', 'next_consultation_forecast'],
        },
        { model: this.scheduleTagModel },
        { model: this.professionalModel, attributes: ['name'] },
      ],
      raw: false,
    });

    const previousStatus = currentSchedule.status;

    await this.scheduleModel.update(
      {
        status: updateStatusScheduleDto.status,
      },
      {
        where: {
          id: id,
          accountId: this.tenantService.tenant.id,
        },
      },
    );

    if (updateStatusScheduleDto.status === StatusEnum.ArrivedPatient) {
      let tagName = 'Sem rótulo';

      if (currentSchedule.tags[0]?.tagId) {
        const tag = await this.tagModel.findOne({
          where: { id: currentSchedule.tags[0]?.tagId },
        });

        if (tag) {
          tagName = tag.name;
        }
      }

      const status = await this.statusLogModel.create({
        accountId: this.tenantService.tenant.id,
        entityId: id,
        type: 'waiting-list',
        status: updateStatusScheduleDto.status,
      });

      console.log(status);

      const notification = {
        professionalId: currentSchedule.professionalId,
        patientName: currentSchedule.patient.name,
        time: currentSchedule.startDate,
        patientId: currentSchedule.patientId,
        professionalName: currentSchedule.professional.name,
        nextConsultationForecast: currentSchedule.patient.get(
          'next_consultation_forecast',
        ),
        tag: tagName,
        id: currentSchedule.id,
      };

      console.log(notification);

      this.sseService.sendNotification(notification);
    }

    if (updateStatusScheduleDto.status === StatusEnum.Attended) {
      if (currentSchedule.treatmentId) {
        const budgetItem = await this.budgetItemModel.findOne({
          where: {
            id: currentSchedule.treatmentId,
            accountId: this.tenantService.tenant.id,
          },
        });

        if (budgetItem) {
          if (!budgetItem.session || budgetItem.session <= 0) {
            await this.budgetItemModel.update(
              { status: 'done' },
              { where: { id: budgetItem.id } },
            );
          } else {
            const currentDone = budgetItem.sessionDone || 0;

            if (currentDone < budgetItem.session) {
              const newSessionDone = currentDone + 1;

              await this.budgetItemModel.update(
                {
                  sessionDone: newSessionDone,
                  ...(newSessionDone >= budgetItem.session
                    ? { status: 'done' }
                    : {}),
                },
                {
                  where: { id: budgetItem.id },
                },
              );
            }
          }
        }
      }
    }

    if (
      updateStatusScheduleDto.status &&
      updateStatusScheduleDto.status !== previousStatus
    ) {
      await this.statusLogModel.create({
        accountId: this.tenantService.tenant.id,
        entityId: id,
        type: 'schedule',
        status: updateStatusScheduleDto.status,
      });
    }

    return currentSchedule;
  }

  updateDate(id: string, updateStatusScheduleDto: UpdateDateScheduleDto) {
    console.log(updateStatusScheduleDto);
    return this.scheduleModel.update(
      {
        startDate: updateStatusScheduleDto.startDate,
        endDate: updateStatusScheduleDto.endDate,
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
    const transaction = await this.sequelize.transaction();

    try {
      await this.scheduleTagModel.destroy({
        where: { scheduleId: id },
        transaction,
      });

      await this.scheduleModel.destroy({
        where: {
          id,
          accountId: this.tenantService.tenant.id,
        },
        transaction,
      });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async getWhatsappClinicCredentials(): Promise<WhatsappToken> {
    const clinic = await this.clinicModel.findOne({
      where: {
        accountId: this.tenantService.tenant.id,
      },
    });
    return {
      token: clinic?.whatsappApiToken || null,
      number: clinic?.whatsappNumber || null,
      url: clinic?.whatsappApiUrl || null,
      status: true,
    };
  }

  async getWhatsappCredentials(): Promise<WhatsappToken> {
    const whatsappClinicToken = await this.getWhatsappClinicCredentials();

    if (
      whatsappClinicToken.number &&
      whatsappClinicToken.token &&
      whatsappClinicToken.url
    ) {
      return whatsappClinicToken;
    }

    const prontdental_tokens = await this.getWhatsappTokens();

    if (!Array.isArray(prontdental_tokens)) {
      throw new Error('Erro no formato da configuração de tokens de Whatsapp');
    }

    if (prontdental_tokens.length === 0) {
      throw new Error(
        'Sem números habilitados para envio de mensagem Whatsapp',
      );
    }

    let last_token = await this.settingsService.getOption(
      WHATSAPP_LAST_TOKEN_KEY,
      null,
    );
    const count_sends = await this.settingsService.getOption(
      WHATSAPP_COUNT_SENDS_KEY,
      0,
    );

    if (last_token === null) {
      last_token = prontdental_tokens[0].token;
      await this.settingsService.setOption(WHATSAPP_LAST_TOKEN_KEY, last_token);
    }

    const last_token_index = prontdental_tokens.findIndex(
      (el) => el.token === last_token,
    );
    if (count_sends === WHATSAPP_MAX_SENDS - 1) {
      await this.settingsService.setOption(WHATSAPP_COUNT_SENDS_KEY, 0);
      if (last_token_index < prontdental_tokens.length - 1) {
        await this.settingsService.setOption(
          WHATSAPP_LAST_TOKEN_KEY,
          prontdental_tokens[last_token_index + 1].token,
        );
      } else {
        await this.settingsService.setOption(
          WHATSAPP_LAST_TOKEN_KEY,
          prontdental_tokens[0].token,
        );
      }
    } else {
      await this.settingsService.setOption(
        WHATSAPP_COUNT_SENDS_KEY,
        count_sends + 1,
      );
    }

    return prontdental_tokens[last_token_index];
  }

  async waMessage(createScheduleDto, patient, greetingMessage, isReminder) {
    try {
      const confirmMessage = createScheduleDto.confirmMessage;
      const startDate = new Date(createScheduleDto.startDate);
      const phoneNumber = '55' + patient.cellPhone.replaceAll(' ', '');

      const diffMs = startDate.getTime() - Date.now();
      const diffHours = diffMs / (1000 * 60 * 60);

      if (isReminder) {
        // ✅ Lembrete ativado
        if (diffHours > 24) {
          // 1. Envia lembrete agora
          await this.whatsappService.sendMessage(greetingMessage, phoneNumber);

          // 2. Agenda confirmação para 24h antes
          const delay = diffMs - 24 * 60 * 60 * 1000;
          await this.whatsappService.sendMessage(
            confirmMessage,
            phoneNumber,
            delay,
          );
        } else {
          // Menos de 24h → só envia confirmação agora
          await this.whatsappService.sendMessage(confirmMessage, phoneNumber);
        }
      } else {
        // 🚀 Lembrete desativado → envia confirmação agora
        await this.whatsappService.sendMessage(confirmMessage, phoneNumber);
      }

      // Caso tenha retorno marcado
      if (createScheduleDto.returnIn !== 0) {
        createScheduleDto.startDate = adicionarDias(
          createScheduleDto.startDate,
          returnDays[createScheduleDto.returnIn],
        );

        const returnDiffMs =
          new Date(createScheduleDto.startDate).getTime() - Date.now();

        if (returnDiffMs > 24 * 60 * 60 * 1000) {
          const delay = returnDiffMs - 24 * 60 * 60 * 1000;
          await this.whatsappService.sendMessage(
            confirmMessage,
            phoneNumber,
            delay,
          );
        } else {
          await this.whatsappService.sendMessage(confirmMessage, phoneNumber);
        }
      }
    } catch (e) {
      console.log(e);
    }
  }

  async getWhatsappTokens() {
    return (
      await this.settingsService.getOption(WHATSAPP_TOKENS_KEY, [])
    ).filter((el) => el.status !== false);
  }

  async disableToken(token: string) {
    const tokens = await this.getWhatsappTokens();
    const token_index = tokens.findIndex((el) => el.token === token);
    tokens[token_index].status = false;
    await this.settingsService.setOption(WHATSAPP_TOKENS_KEY, tokens);
  }
}
