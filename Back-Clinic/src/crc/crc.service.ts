/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  Scope,
} from '@nestjs/common';
import { CreateCrcDto } from './dto/create-crc.dto';
import { UpdateCrcDto } from './dto/update-crc.dto';
import { TenantService } from 'src/tenant/tenant/tenant.service';
import { TenantModelService } from 'src/tenant/tenant/tenant.serviceModel';
import { TenantModel } from 'src/common/decorators/tenant.decorators';
import { Schedule, StatusEnum } from 'src/schedules/entities/schedule.entity';
import { Patient } from 'src/patients/entities/patient.entity';
import { Budget } from 'src/budgets/entities/budget.entity';
import { col, fn, literal, Op, Sequelize, where } from 'sequelize';
import { StatusLog } from 'src/status_logs/entities/status_log.entity';
import { Professional } from 'src/professionals/entities/professional.entity';
import { ScheduleTag } from 'src/schedules/entities/schedule.tag.entity';
import { Tag } from 'src/tags/entities/tag.entity';
import { isValid, parseISO } from 'date-fns';
import { Transaction } from 'src/transactions/entities/transaction.entity';
import * as dayjs from 'dayjs';
import { ReturnList } from 'src/return-list/entities/return-list.entity';

@Injectable({ scope: Scope.REQUEST })
export class CrcService {
  constructor(
    private tenantService: TenantService,
    private readonly tenantModelService: TenantModelService,
  ) {}

  @TenantModel(Schedule)
  private readonly scheduleModel: typeof Schedule;

  @TenantModel(StatusLog)
  private readonly statusLogModel: typeof StatusLog;

  @TenantModel(Patient)
  private readonly patientModel: typeof Patient;

  @TenantModel(Budget)
  private readonly budgetModel: typeof Budget;

  @TenantModel(Professional)
  private readonly professionalModel: typeof Professional;

  @TenantModel(Transaction)
  private readonly transactionModel: typeof Transaction;

  @TenantModel(ScheduleTag)
  private readonly scheduleTagModel: typeof ScheduleTag;

  @TenantModel(Tag)
  private readonly tagModel: typeof Tag;

  @TenantModel(ReturnList)
  private readonly returnListModel: typeof ReturnList;

  async findAllCRCCount() {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const validPatients = await this.patientModel.findAll({
      where: {
        active: 1,
        birthDate: {
          [Op.not]: null,
        },
        accountId: this.tenantService.tenant.id,
      },
      attributes: ['birthDate'],
    });

    const birthdayCount = validPatients.filter((p) => {
      try {
        const date =
          typeof p.birthDate === 'string'
            ? parseISO(p.birthDate)
            : new Date(p.birthDate);
        return isValid(date);
      } catch {
        return false;
      }
    }).length;

    const [
      scheduleCount,
      budgetCount,
      foulsCount,
      deselectionsCount,
      overdueTransactions,
      returnsCount,
    ] = await Promise.all([
      this.scheduleModel.count(),
      this.budgetModel.count({ where: { active: true } }),
      this.scheduleModel.count({ where: { status: 'MS' } }),
      this.scheduleModel.count({
        where: { status: { [Op.in]: ['CP', 'CS'] } },
      }),
      this.transactionModel.findAll({
        where: {
          dueDate: { [Op.lt]: startOfToday },
          isParent: false,
          accountId: this.tenantService.tenant.id,
          active: true,
        },
        attributes: ['id', 'isPaid', 'dueDate', 'value'],
      }),
      this.returnListModel.count({
        where: {
          accountId: this.tenantService.tenant.id,
        },
      }),
    ]);

    const transactionIds = overdueTransactions.map((t) => t.id);

    const statusLogs = await this.statusLogModel.findAll({
      where: { entityId: transactionIds, type: 'transaction' },
      attributes: ['entityId', 'status'],
    });

    const logsByTransaction = statusLogs.reduce((acc, log) => {
      if (!acc[log.entityId]) acc[log.entityId] = [];
      acc[log.entityId].push(log.status);
      return acc;
    }, {} as Record<string, string[]>);

    const vencidas = overdueTransactions.filter((tx) => {
      const logs = logsByTransaction[tx.id] || [];
      const foiRenegociado = logs.includes('won');
      const teveContato = logs.includes('in_progress');

      return !tx.isPaid && !foiRenegociado; // mantém contato realizado dentro
    }).length;

    console.log('vencidas', vencidas);

    return {
      aniversariantes: birthdayCount,
      agendamentos: scheduleCount,
      orcamentos: budgetCount,
      faltas: foulsCount,
      desmarcacoes: deselectionsCount,
      inadimplencia: vencidas,
      retornos: returnsCount,
    };
  }

  async findAllScheduleMissed() {
    try {
      const schedules = await this.scheduleModel.findAll({
        where: { accountId: this.tenantService.tenant.id },
        include: [
          {
            model: this.patientModel,
            attributes: ['name', 'cellPhone'],
          },
          {
            model: this.professionalModel,
            attributes: ['name'],
          },
          {
            model: this.scheduleTagModel,
            include: [
              {
                model: this.tagModel,
                as: 'tag',
                attributes: ['name'],
              },
            ],
          },
        ],
        raw: false,
      });

      const scheduleIds = schedules.map((s) => s.id);

      const statusLogs = await this.statusLogModel.findAll({
        where: {
          entityId: scheduleIds,
          type: 'schedule',
        },
        order: [['created_at', 'ASC']],
      });

      const statusLogsByScheduleId = statusLogs.reduce((acc, log) => {
        if (!acc[log.entityId]) acc[log.entityId] = [];
        acc[log.entityId].push(log);
        return acc;
      }, {} as Record<string, typeof statusLogs>);

      function classifySchedule(logs) {
        if (!logs || logs.length === 0) return null;

        const faltaIndex = logs.findIndex((l) => l.status === 'MS');

        if (faltaIndex !== -1) {
          const logsDepoisDaFalta = logs.slice(faltaIndex + 1);

          const reagendado = logsDepoisDaFalta.some((l) =>
            ['SC', 'CF', 'AP', 'AT'].includes(l.status),
          );
          if (reagendado) return 'Agendada';

          const teveContato = logsDepoisDaFalta.some(
            (l) => l.status === 'contacted',
          );
          if (teveContato) return 'Contato Realizado';

          return 'Falta';
        }

        return null;
      }

      const grouped = {
        Falta: [],
        'Contato Realizado': [],
        Agendada: [],
      };

      schedules.forEach((schedule) => {
        const logs = statusLogsByScheduleId[schedule.id] || [];
        const classification = classifySchedule(logs);

        if (classification) {
          grouped[classification].push({
            id: schedule.id,
            patientName: schedule.patient?.name || 'Sem nome',
            professionalName: schedule.professional?.name || 'Sem profissional',
            statusLogs: logs,
            observation: schedule.observation,
            observationCRC: schedule.observationCRC,
            startDate: schedule.startDate,
            status: schedule.status,
            phone: schedule.patient?.cellPhone,
            tag: schedule.tags?.[0]?.tag?.name || 'Sem rótulo',
          });
        }
      });

      return grouped;
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
      return { Falta: [], 'Contato Realizado': [], Agendada: [] };
    }
  }

  async updateScheduleFromKanban(
    scheduleId: string,
    columnName: 'Falta' | 'Contato Realizado' | 'Agendada',
  ) {
    const schedule = await this.scheduleModel.findOne({
      where: { id: scheduleId },
    });
    if (!schedule) throw new NotFoundException('Agendamento não encontrado');

    if (columnName === 'Contato Realizado') {
      await this.statusLogModel.create({
        entityId: schedule.id,
        type: 'schedule',
        status: 'contacted',
        createdAt: new Date(),
      });
      return { message: 'Contato realizado registrado com sucesso.' };
    }

    if (columnName === 'Agendada') {
      schedule.status = StatusEnum.Scheduled;
      await schedule.save();
      await this.statusLogModel.create({
        entityId: schedule.id,
        type: 'schedule',
        status: 'SC',
        createdAt: new Date(),
      });
      return { message: 'Agendamento atualizado para Agendado (SC).' };
    }

    // Coluna: Falta → não faz nada
    return { message: 'Sem alteração no status.' };
  }

  async findAllScheduleCanceled() {
    try {
      const schedules = await this.scheduleModel.findAll({
        where: { accountId: this.tenantService.tenant.id },
        include: [
          {
            model: this.patientModel,
            attributes: ['name', 'cellPhone'],
          },
          {
            model: this.professionalModel,
            attributes: ['name'],
          },
          {
            model: this.scheduleTagModel,
            include: [
              {
                model: this.tagModel,
                as: 'tag',
                attributes: ['name'],
              },
            ],
          },
        ],
        raw: false,
      });

      const scheduleIds = schedules.map((s) => s.id);

      const statusLogs = await this.statusLogModel.findAll({
        where: {
          entityId: scheduleIds,
          type: 'schedule',
        },
        order: [['created_at', 'ASC']],
      });

      const statusLogsByScheduleId = statusLogs.reduce((acc, log) => {
        if (!acc[log.entityId]) acc[log.entityId] = [];
        acc[log.entityId].push(log);
        return acc;
      }, {} as Record<string, typeof statusLogs>);

      function classifyCanceled(logs) {
        if (!logs || logs.length === 0) return null;

        const cancelIndex = logs.findIndex((l) =>
          ['CP', 'CS'].includes(l.status),
        );

        if (cancelIndex !== -1) {
          const logsDepoisCancelamento = logs.slice(cancelIndex + 1);

          const reagendado = logsDepoisCancelamento.some((l) =>
            ['SC', 'CF', 'AP', 'AT'].includes(l.status),
          );
          if (reagendado) return 'Agendada';

          const teveContato = logsDepoisCancelamento.some(
            (l) => l.status === 'contacted',
          );
          if (teveContato) return 'Contato Realizado';

          return 'Desmarcado';
        }

        return null;
      }

      const grouped = {
        Desmarcado: [],
        'Contato Realizado': [],
        Agendada: [],
      };

      schedules.forEach((schedule) => {
        const logs = statusLogsByScheduleId[schedule.id] || [];
        const classification = classifyCanceled(logs);

        if (classification) {
          grouped[classification].push({
            id: schedule.id,
            patientName: schedule.patient?.name || 'Sem nome',
            professionalName: schedule.professional?.name || 'Sem profissional',
            statusLogs: logs,
            observation: schedule.observation,
            observationCRC: schedule.observationCRC,
            startDate: schedule.startDate,
            status: schedule.status,
            phone: schedule.patient?.cellPhone,
            tag: schedule.tags?.[0]?.tag?.name || 'Sem rótulo',
          });
        }
      });

      return grouped;
    } catch (error) {
      console.error('Erro ao buscar agendamentos cancelados:', error);
      return { Cancelado: [], 'Contato Realizado': [], Agendada: [] };
    }
  }

  async updateScheduleFromCancelKanban(
    scheduleId: string,
    columnName: 'Desmarcado' | 'Contato Realizado' | 'Agendada',
  ) {
    const schedule = await this.scheduleModel.findOne({
      where: { id: scheduleId },
    });
    if (!schedule) throw new NotFoundException('Agendamento não encontrado');

    if (columnName === 'Contato Realizado') {
      await this.statusLogModel.create({
        entityId: schedule.id,
        type: 'schedule',
        status: 'contacted',
        createdAt: new Date(),
      });
      return { message: 'Contato realizado registrado com sucesso.' };
    }

    if (columnName === 'Agendada') {
      schedule.status = StatusEnum.Scheduled;
      await schedule.save();
      await this.statusLogModel.create({
        entityId: schedule.id,
        type: 'schedule',
        status: 'SC',
        createdAt: new Date(),
      });
      return { message: 'Agendamento atualizado para Agendado (SC).' };
    }

    return { message: 'Sem alteração no status.' };
  }

  async startSchedule(range: 'day' | 'week' | 'month' | string) {
    const today = dayjs().startOf('day');

    let startDate = today;
    let endDate = today.endOf('day');

    if (range === 'week') {
      startDate = today.startOf('week');
      endDate = today.endOf('week');
    } else if (range === 'month') {
      startDate = today.startOf('month');
      endDate = today.endOf('month');
    } else if (!isNaN(Number(range))) {
      const monthNumber = Number(range);
      startDate = today.month(monthNumber - 1).startOf('month');
      endDate = today.month(monthNumber - 1).endOf('month');
    }

    const scheduledCount = await this.scheduleModel.count({
      where: {
        status: {
          [Op.in]: ['CS', 'AT', 'SC'],
        },
        startDate: {
          [Op.between]: [startDate.toDate(), endDate.toDate()],
        },
        accountId: this.tenantService.tenant.id,
      },
    });

    const returnsCount = await this.returnListModel.count({
      where: {
        accountId: this.tenantService.tenant.id,
        status: 'pending',
        [Op.or]: [
          // Se for dias
          {
            returnType: 'D',
            [Op.and]: where(
              literal(`"start_date" + ("return_value" * interval '1 day')`),
              {
                [Op.between]: [startDate.toDate(), endDate.toDate()],
              },
            ),
          },
          // Se for meses
          {
            returnType: 'M',
            [Op.and]: where(
              literal(`"start_date" + ("return_value" * interval '1 month')`),
              {
                [Op.between]: [startDate.toDate(), endDate.toDate()],
              },
            ),
          },
        ],
      },
    });

    console.log('returnsCount', returnsCount);

    // const attendedCount = await this.scheduleModel.count({
    //   where: {
    //     status: 'AT',
    //     startDate: {
    //       [Op.between]: [startDate.toDate(), endDate.toDate()],
    //     },
    //     accountId: this.tenantService.tenant.id,
    //   },
    // });

    const canceledCount = await this.scheduleModel.count({
      where: {
        status: {
          [Op.in]: ['CP', 'CS', 'MS'],
        },
        startDate: {
          [Op.between]: [startDate.toDate(), endDate.toDate()],
        },
        accountId: this.tenantService.tenant.id,
      },
    });

    const allBirthdays = await this.patientModel.findAll({
      attributes: ['id', 'name', 'birthDate'],
      where: {
        active: 1,
        birthDate: {
          [Op.not]: null,
        },
        accountId: this.tenantService.tenant.id,
      },
    });

    const birthdayCount = allBirthdays.filter((patient) => {
      const birthDate = dayjs(patient.birthDate);
      const birthdayThisYear = birthDate.year(today.year());

      return (
        birthdayThisYear.isSame(startDate, 'day') ||
        birthdayThisYear.isSame(endDate, 'day') ||
        (birthdayThisYear.isAfter(startDate) &&
          birthdayThisYear.isBefore(endDate))
      );
    }).length;

    return {
      scheduled: scheduledCount,
      returns: returnsCount,
      canceled: canceledCount,
      birthdays: birthdayCount,
    };
  }

  async budgetsTotalAndOpen() {
    const currentYear = new Date().getFullYear();

    const budgets: any[] = await this.budgetModel.findAll({
      where: {
        created_at: {
          [Op.gte]: new Date(`${currentYear}-01-01T00:00:00.000Z`),
          [Op.lte]: new Date(`${currentYear}-12-31T23:59:59.999Z`),
        },
        accountId: this.tenantService.tenant.id,
        active: true,
      },
      raw: true,
    });

    const monthlyData = Array.from({ length: 12 }, () => ({
      total: 0,
      open: 0,
    }));

    for (const budget of budgets) {
      const createdAt = new Date(budget.created_at);

      const month = createdAt.getMonth(); // 0 a 11

      monthlyData[month].total += 1;

      if (budget.status === 'O') {
        monthlyData[month].open += 1;
      }
    }

    return monthlyData;
  }

  async getMonthlyEarningsAndExpenses(range = 'all') {
    const today = dayjs();
    const currentYear = today.year();

    let startDate = dayjs(`${currentYear}-01-01`).startOf('day');
    let endDate = dayjs(`${currentYear}-12-31`).endOf('day');

    if (range === 'day') {
      startDate = today.startOf('day');
      endDate = today.endOf('day');
    } else if (range === 'week') {
      startDate = today.startOf('week');
      endDate = today.endOf('week');
    } else if (range === 'month') {
      startDate = today.startOf('month');
      endDate = today.endOf('month');
    } else if (!isNaN(Number(range))) {
      const monthNumber = Number(range);
      startDate = dayjs()
        .year(currentYear)
        .month(monthNumber - 1)
        .startOf('month');
      endDate = dayjs()
        .year(currentYear)
        .month(monthNumber - 1)
        .endOf('month');
    }

    const where: any = {
      created_at: {
        [Op.between]: [startDate.toDate(), endDate.toDate()],
      },
      accountId: this.tenantService.tenant.id,
      active: true,
    };

    const transactions: any[] = await this.transactionModel.findAll({
      where,
      raw: true,
    });

    let revenue = 0;
    let expense = 0;

    for (const t of transactions) {
      const value = Number(t.value);
      if (t.type === 'R') revenue += value;
      if (t.type === 'E') expense += value;
    }

    return {
      revenue: [revenue],
      expense: [-expense],
      balance: [revenue - expense],
    };
  }

  async getMonthlyReceivedAndPending() {
    const currentYear = new Date().getFullYear();

    const transactions: any[] = await this.transactionModel.findAll({
      where: {
        type: 'R',
        created_at: {
          [Op.gte]: new Date(`${currentYear}-01-01T00:00:00.000Z`),
          [Op.lte]: new Date(`${currentYear}-12-31T23:59:59.999Z`),
        },
        accountId: this.tenantService.tenant.id,
        active: true,
      },
      raw: true,
    });

    const monthlyData = Array.from({ length: 12 }, () => ({
      received: 0,
      pending: 0,
    }));

    for (const t of transactions) {
      const month = new Date(t.created_at).getMonth();
      const value = Number(t.value);

      if (t.isPaid) {
        monthlyData[month].received += value;
      } else {
        monthlyData[month].pending += value;
      }
    }

    // Retornar apenas os meses de julho a dezembro (índices 6 a 11)
    const received = monthlyData.slice(6).map((item) => item.received);
    const pending = monthlyData.slice(6).map((item) => item.pending);

    return { received, pending };
  }

  async getWeeklyAppointmentSummary() {
    const now = new Date();
    const startOfWeek = new Date(now);
    const endOfWeek = new Date(now);

    // Segunda-feira (início da semana)
    startOfWeek.setDate(now.getDate() - now.getDay() + 1);
    startOfWeek.setHours(0, 0, 0, 0);

    // Domingo (fim da semana)
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const budgets: any[] = await this.budgetModel.findAll({
      where: {
        active: true,
        created_at: {
          [Op.gte]: startOfWeek,
          [Op.lte]: endOfWeek,
        },
      },
      raw: true,
    });

    const approved = Array(7).fill(0);
    const rejected = Array(7).fill(0);

    let totalApproved = 0;
    let totalRejected = 0;

    for (const budget of budgets) {
      const date = new Date(budget.created_at);
      const dayIndex = (date.getDay() + 6) % 7;

      if (budget.status === 'A') {
        approved[dayIndex]++;
        totalApproved +=
          Number(budget.subtotal - budget.discount - budget.downPayment) ?? 0;
      } else if (budget.status === 'R') {
        rejected[dayIndex]++;
        totalRejected +=
          Number(budget.subtotal - budget.discount - budget.downPayment) ?? 0;
      }
    }

    return {
      approved,
      rejected,
      totalApproved,
      totalRejected,
    };
  }

  async getBudgetStatusSummary(period: string) {
    const now = new Date();
    let start: Date;
    let end: Date;

    if (period === 'day') {
      const year = now.getFullYear();
      const month = now.getMonth();
      const date = now.getDate();
      start = new Date(year, month, date, 0, 0, 0, 0);
      end = new Date(year, month, date, 23, 59, 59, 999);
    } else if (period === 'week') {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      const year = now.getFullYear();
      const month = now.getMonth();
      start = new Date(year, month, diff, 0, 0, 0, 0);
      end = new Date(year, month, diff + 6, 23, 59, 59, 999);
    } else if (period === 'month') {
      const year = now.getFullYear();
      const month = now.getMonth();
      start = new Date(year, month, 1, 0, 0, 0, 0);
      end = new Date(year, month + 1, 0, 23, 59, 59, 999);
    }

    const where: any = {
      accountId: this.tenantService.tenant.id,
      active: true,
    };

    if (period !== 'all') {
      where.date = {
        [Op.between]: [
          start.toISOString().slice(0, 10),
          end.toISOString().slice(0, 10),
        ],
      };
    }

    const budgets = await this.budgetModel.findAll({
      where,
      raw: true,
    });

    const budgetIds = budgets.map((b) => b.id);

    const transactions = await this.transactionModel.findAll({
      where: {
        entityId: {
          [Op.in]: budgetIds,
        },
        type: 'R',
        active: true,
      },
      attributes: ['entityId', 'isPaid'],
      raw: true,
    });

    const transactionMap = transactions.reduce((acc, transaction) => {
      if (!acc[transaction.entityId]) {
        acc[transaction.entityId] = [];
      }
      acc[transaction.entityId].push(transaction.isPaid);
      return acc;
    }, {} as Record<string, boolean[]>);

    const fullyPaidBudgetIds = new Set(
      Object.entries(transactionMap)
        .filter(
          ([_, paidArray]) =>
            paidArray.length > 0 && paidArray.every((p) => p === true),
        )
        .map(([entityId]) => entityId),
    );

    const summary = {
      andamento: 0,
      fechado: 0,
      aberto: 0,
      perdido: 0,
    };

    for (const budget of budgets) {
      const isPaid = fullyPaidBudgetIds.has(String(budget.id));
      const effectiveStatus = isPaid ? 'P' : budget.status;

      switch (effectiveStatus) {
        case 'P':
          summary.fechado++;
          break;
        case 'O':
          summary.aberto++;
          break;
        case 'A':
          summary.andamento++;
          break;
        case 'R':
          summary.perdido++;
          break;
      }
    }

    return summary;
  }

  async getBudgetSummary(
    period:
      | 'day'
      | 'week'
      | 'month'
      | 'january'
      | 'february'
      | 'march'
      | 'april'
      | 'may'
      | 'june'
      | 'july'
      | 'august'
      | 'september'
      | 'october'
      | 'november'
      | 'december' = 'month',
  ) {
    const now = new Date();
    const year = now.getFullYear();

    let start: Date;
    let end: Date;

    if (period === 'day') {
      const date = now.getDate();
      const month = now.getMonth();
      start = new Date(year, month, date, 0, 0, 0, 0);
      end = new Date(year, month, date, 23, 59, 59, 999);
    } else if (period === 'week') {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      const month = now.getMonth();
      start = new Date(year, month, diff, 0, 0, 0, 0);
      end = new Date(year, month, diff + 6, 23, 59, 59, 999);
    } else if (period === 'month') {
      const month = now.getMonth();
      start = new Date(year, month, 1, 0, 0, 0, 0);
      end = new Date(year, month + 1, 0, 23, 59, 59, 999);
    } else {
      const monthMap: Record<string, number> = {
        january: 0,
        february: 1,
        march: 2,
        april: 3,
        may: 4,
        june: 5,
        july: 6,
        august: 7,
        september: 8,
        october: 9,
        november: 10,
        december: 11,
      };

      const monthNum = monthMap[period];
      if (monthNum === undefined)
        throw new BadRequestException(`Invalid period: ${period}`);

      start = new Date(year, monthNum, 1, 0, 0, 0, 0);
      end = new Date(year, monthNum + 1, 0, 23, 59, 59, 999);
    }

    const budgets = await this.budgetModel.findAll({
      where: {
        accountId: this.tenantService.tenant.id,
        active: true,
        date: {
          [Op.between]: [
            start.toISOString().slice(0, 10),
            end.toISOString().slice(0, 10),
          ],
        },
      },
    });

    const budgetIds = budgets.map((b) => b.id);

    const transactions = await this.transactionModel.findAll({
      where: {
        entityId: {
          [Op.in]: budgetIds,
        },
        type: 'R',
        active: true,
      },
      attributes: ['entityId', 'isPaid'],
      raw: true,
    });

    const transactionMap = transactions.reduce((acc, transaction) => {
      if (!acc[transaction.entityId]) {
        acc[transaction.entityId] = [];
      }
      acc[transaction.entityId].push(transaction.isPaid);
      return acc;
    }, {} as Record<string, boolean[]>);

    const fullyPaidBudgetIds = new Set(
      Object.entries(transactionMap)
        .filter(
          ([_, paidArray]) =>
            paidArray.length > 0 && paidArray.every((p) => p === true),
        )
        .map(([entityId]) => entityId),
    );

    const result = {
      fechado: { count: 0, total: 0 },
      aberto: { count: 0, total: 0 },
      andamento: { count: 0, total: 0 },
      perdido: { count: 0, total: 0 },
    };

    for (const budget of budgets) {
      const subtotal = Number(budget.subtotal) || 0;
      const discount = Number(budget.discount) || 0;
      // const downPayment = Number(budget.downPayment) || 0;
      const total = subtotal - discount;

      const isPaid = fullyPaidBudgetIds.has(String(budget.id));
      const effectiveStatus = isPaid ? 'P' : budget.status;

      switch (effectiveStatus) {
        case 'P':
          result.fechado.count++;
          result.fechado.total += total;
          break;
        case 'O':
          result.aberto.count++;
          result.aberto.total += total;
          break;
        case 'A':
          result.andamento.count++;
          result.andamento.total += total;
          break;
        case 'R':
          result.perdido.count++;
          result.perdido.total += total;
          break;
      }
    }

    return result;
  }
}
