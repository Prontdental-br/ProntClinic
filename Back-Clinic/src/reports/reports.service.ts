/* eslint-disable prettier/prettier */
import { BadRequestException, Injectable, Res, Scope } from '@nestjs/common';

import { CreateReportDto } from './dto/create-report';
import { Report } from './entities/report.entity';
import { ExcelService } from './excel.service';
import { InjectModel } from '@nestjs/sequelize';
import { TenantService } from 'src/tenant/tenant/tenant.service';
import { Transaction } from 'src/transactions/entities/transaction.entity';

import { Response } from 'express';

import { Op, Sequelize } from 'sequelize';
import { Financials } from 'src/financial/entities/financial.entity';
import { SchedulesService } from 'src/schedules/schedules.service';
import * as moment from 'moment';
import { TransactionsService } from 'src/transactions/transactions.service';
import { BudgetsService } from 'src/budgets/budgets.service';
import { TenantModelService } from 'src/tenant/tenant/tenant.serviceModel';
import { TenantModel } from 'src/common/decorators/tenant.decorators';

@Injectable({ scope: Scope.REQUEST })
export class ReportsService {
  constructor(
    private excelService: ExcelService,
    private tenantService: TenantService,
    private schedulesService: SchedulesService,
    private transactionsService: TransactionsService,
    private budgetService: BudgetsService,
    private tenantModelService: TenantModelService,
  ) {}

  @TenantModel(Report)
  private readonly reportModel: typeof Report;

  @TenantModel(Transaction)
  private readonly transactionModel: typeof Transaction;

  @TenantModel(Financials)
  private readonly financialModel: typeof Financials;

  async create(createReportDto: CreateReportDto, res: Response) {
    let startDate: Date | null = null;
    let endDate: Date | null = null;

    const whereClause: any = {
      accountId: this.tenantService.tenant.id,
      isParent: false,
      active: true,
    };

    if (createReportDto.transactionType === 'all') {
      createReportDto.period = 'all';

      const firstRecord = await this.transactionModel.findOne({
        where: {
          accountId: this.tenantService.tenant.id,
          isParent: false,
          active: true,
        },
        order: [['referenceDate', 'ASC']],
        attributes: ['referenceDate'],
        raw: true,
      });

      const lastRecord = await this.transactionModel.findOne({
        where: {
          accountId: this.tenantService.tenant.id,
          isParent: false,
          active: true,
        },
        order: [['referenceDate', 'DESC']],
        attributes: ['referenceDate'],
        raw: true,
      });

      if (firstRecord?.referenceDate && lastRecord?.referenceDate) {
        startDate = new Date(firstRecord.referenceDate);
        startDate.setHours(0, 0, 0, 0);

        endDate = new Date(lastRecord.referenceDate);
        endDate.setHours(23, 59, 59, 999);

        whereClause[Op.or] = [
          { referenceDate: { [Op.between]: [startDate, endDate] } },
          {
            [Op.and]: [
              { referenceDate: { [Op.is]: null } },
              { created_at: { [Op.between]: [startDate, endDate] } },
            ],
          },
        ];
      }
    }

    if (createReportDto.dueStart || createReportDto.dueEnd) {
      createReportDto.period = 'custom';
    }

    if (['daily', 'week', 'month', 'year'].includes(createReportDto.period)) {
      startDate = new Date();
      endDate = new Date();

      if (createReportDto.period === 'daily') {
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);

        whereClause[Op.or] = [
          { referenceDate: { [Op.between]: [startDate, endDate] } },
          { paymentDate: { [Op.between]: [startDate, endDate] } },
        ];
      } else if (createReportDto.period === 'week') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        startDate = new Date(today);
        startDate.setDate(today.getDate() - today.getDay());
        startDate.setHours(0, 0, 0, 0);

        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);

        whereClause[Op.or] = [
          {
            referenceDate: { [Op.between]: [startDate, endDate] },
          },

          {
            [Op.and]: [
              { referenceDate: { [Op.is]: null } },
              { created_at: { [Op.between]: [startDate, endDate] } },
            ],
          },
        ];
      } else if (createReportDto.period === 'month') {
        startDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
        startDate.setHours(0, 0, 0, 0);

        endDate = new Date(
          startDate.getFullYear(),
          startDate.getMonth() + 1,
          0,
        );
        endDate.setHours(23, 59, 59, 999);

        whereClause[Op.or] = [
          {
            referenceDate: { [Op.between]: [startDate, endDate] },
          },

          {
            [Op.and]: [
              { referenceDate: { [Op.is]: null } },
              { created_at: { [Op.between]: [startDate, endDate] } },
            ],
          },
        ];
      } else if (createReportDto.period === 'year') {
        startDate = new Date(startDate.getFullYear(), 0, 1);
        startDate.setHours(0, 0, 0, 0);

        endDate = new Date(startDate.getFullYear(), 11, 31);
        endDate.setHours(23, 59, 59, 999);

        whereClause[Op.or] = [
          {
            referenceDate: { [Op.between]: [startDate, endDate] },
          },

          {
            [Op.and]: [
              { referenceDate: { [Op.is]: null } },
              { created_at: { [Op.between]: [startDate, endDate] } },
            ],
          },
        ];
      }
    }

    if (
      createReportDto.transactionType === 'expense' ||
      createReportDto.transactionType === 'revenue'
    ) {
      whereClause['type'] =
        createReportDto.transactionType === 'expense' ? 'E' : 'R';
      delete whereClause[Op.or];
      delete whereClause.referenceDate;
      delete whereClause.paymentDate;
      delete whereClause.dueDate;
    } else if (createReportDto.transactionType === 'paid') {
      whereClause['is_paid'] = true;
      delete whereClause.created_at;
      delete whereClause[Op.or];
    } else if (createReportDto.transactionType === 'open') {
      whereClause['is_paid'] = false;
      delete whereClause.created_at;
      delete whereClause[Op.or];
    } else if (createReportDto.transactionType === 'expense-paid') {
      whereClause['type'] = 'E';
      whereClause['is_paid'] = true;
      delete whereClause.created_at;
      delete whereClause[Op.or];
    } else if (createReportDto.transactionType === 'expense-open') {
      whereClause['type'] = 'E';
      whereClause['is_paid'] = false;
      delete whereClause.created_at;
      delete whereClause[Op.or];
    } else if (createReportDto.transactionType === 'expense-open') {
      whereClause['type'] = 'E';
      whereClause['is_paid'] = false;
      delete whereClause.created_at;
      delete whereClause[Op.or];
    } else if (createReportDto.transactionType === 'revenue-month') {
      const now = new Date();
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      startDate.setHours(0, 0, 0, 0);

      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      endDate.setHours(23, 59, 59, 999);

      whereClause['type'] = 'R';
      whereClause.referenceDate = { [Op.between]: [startDate, endDate] };

      delete whereClause[Op.or];
    } else if (createReportDto.transactionType === 'revenue-daily') {
      const now = new Date();
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      startDate.setHours(0, 0, 0, 0);

      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      endDate.setHours(23, 59, 59, 999);

      whereClause['type'] = 'R';
      whereClause.referenceDate = { [Op.between]: [startDate, endDate] };

      delete whereClause[Op.or];
    } else if (createReportDto.transactionType === 'paid-month') {
      const now = new Date();
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      startDate.setHours(0, 0, 0, 0);

      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      endDate.setHours(23, 59, 59, 999);

      whereClause['is_paid'] = true;

      whereClause[Op.or] = [
        { paymentDate: { [Op.between]: [startDate, endDate] } },
        // { referenceDate: { [Op.between]: [startDate, endDate] } },
      ];
    } else if (createReportDto.transactionType === 'overdue') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      whereClause['is_paid'] = false;
      whereClause['dueDate'] = { [Op.lt]: today };

      delete whereClause[Op.or];
      delete whereClause.created_at;
    } else if (createReportDto.transactionType === 'paid-daily') {
      const now = new Date();
      const startDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
      );
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
      );
      endDate.setHours(23, 59, 59, 999);

      whereClause['type'] = 'R';

      whereClause[Op.or] = [
        {
          [Op.and]: [
            { is_paid: true },
            { paymentDate: { [Op.between]: [startDate, endDate] } },
          ],
        },
        { dueDate: { [Op.between]: [startDate, endDate] } },
      ];

      delete whereClause.created_at;
    }

    if (createReportDto.dueStart || createReportDto.dueEnd) {
      whereClause.dueDate = {};

      if (createReportDto.dueStart) {
        const start = new Date(createReportDto.dueStart);
        start.setUTCHours(0, 0, 0, 0);
        whereClause.dueDate[Op.gte] = start;
      }

      if (createReportDto.dueEnd) {
        const end = new Date(createReportDto.dueEnd);
        end.setUTCHours(23, 59, 59, 999);
        whereClause.dueDate[Op.lte] = end;
      }
    }

    if (createReportDto.payStart || createReportDto.payEnd) {
      whereClause.paymentDate = {};
      if (createReportDto.payStart) {
        whereClause.paymentDate[Op.gte] = new Date(createReportDto.payStart);
      }
      if (createReportDto.payEnd) {
        whereClause.paymentDate[Op.lte] = new Date(createReportDto.payEnd);
      }
    }

    if (createReportDto.createdStart) {
      const date = new Date(createReportDto.createdStart);

      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      whereClause[Op.or] = [
        {
          referenceDate: { [Op.between]: [startOfDay, endOfDay] },
        },

        {
          [Op.and]: [
            { referenceDate: { [Op.is]: null } },
            { created_at: { [Op.between]: [startOfDay, endOfDay] } },
          ],
        },
      ];
    }

    if (createReportDto.transactionType === 'revenue-month') {
      createReportDto.period = 'month';
    } else if (createReportDto.transactionType === 'expense-month') {
      createReportDto.period = 'month';
    } else if (createReportDto.transactionType === 'revenue-daily') {
      createReportDto.period = 'daily';
    } else if (createReportDto.transactionType === 'paid-month') {
      createReportDto.period = 'month';
    }

    const transactions = await this.transactionModel.findAll({
      where: whereClause,
    });

    if (!transactions || transactions.length === 0) {
      throw new BadRequestException(
        'É necessário ter registros financeiros para gerar o relatório.',
      );
    }

    // console.log(transactions);

    if (!startDate && !endDate && transactions.length > 0) {
      const validRefDates = transactions
        .map((t) =>
          t.referenceDate ? new Date(t.referenceDate).getTime() : null,
        )
        .filter((d) => d !== null);

      if (validRefDates.length > 0) {
        startDate = new Date(Math.min(...validRefDates));
        startDate.setHours(0, 0, 0, 0);

        endDate = new Date(Math.max(...validRefDates));
        endDate.setHours(23, 59, 59, 999);
      } else {
        startDate = new Date(
          Math.min(
            ...transactions.map((t) => new Date(t.created_at).getTime()),
          ),
        );
        startDate.setHours(0, 0, 0, 0);

        endDate = new Date(
          Math.max(
            ...transactions.map((t) => new Date(t.created_at).getTime()),
          ),
        );
        endDate.setHours(23, 59, 59, 999);
      }
    }

    const total = transactions.reduce(
      (acc, transaction) => acc + Number(transaction.value),
      0,
    );

    const payload: any = {
      ...createReportDto,
      total: total.toFixed(2),
      accountId: this.tenantService.tenant.id,
    };

    payload.transactionType = createReportDto.transactionType ?? 'all';

    if (startDate instanceof Date && !isNaN(startDate.getTime())) {
      payload.startDate = startDate;
    }
    if (endDate instanceof Date && !isNaN(endDate.getTime())) {
      payload.endDate = endDate;
    }

    const report = await this.reportModel.create(payload);

    return this.excelService.generate(transactions, res, report);
  }

  async download(res: Response, id: string) {
    console.log('ID', id);

    const report = await this.reportModel.findOne({
      where: {
        id,
      },
    });

    console.log('REPORTS', report);

    const transactions = await this.transactionModel.findAll({
      where: {
        accountId: this.tenantService.tenant.id,
        isParent: false,
        created_at: {
          [Op.between]: [report.startDate, report.endDate],
        },
      },
    });

    return this.excelService.generate(transactions, res, report);
  }

  async remove(id: string) {
    return await this.reportModel.destroy({
      where: {
        id: id,
        accountId: this.tenantService.tenant.id,
      },
    });
  }

  async downloadReport(res: Response, data: any) {
    return this.excelService.writeToCsv(data, res, 'data');
  }

  async getReport(
    startDate = moment().startOf('day').toDate(),
    endDate = moment().endOf('day').toDate(),
  ) {
    const scheduleData = await this.schedulesService.findAllByDate(
      startDate,
      endDate,
    );

    console.log('scheduleData-----------', scheduleData);

    const schedule = {
      appointmentConfirmed: 0,
      appointmentCanceled: 0,
      appointmentScheduled: 0,
      appointmentAttended: 0,
      appointmentMissed: 0,
    };
    for (let index = 0; index < scheduleData.length; index += 1) {
      const current = scheduleData[index];
      if (current.status === 'MS') {
        schedule.appointmentMissed += 1;
        continue;
      }
      if (current.status === 'CS' || current.status === 'CP') {
        schedule.appointmentCanceled += 1;
        continue;
      }
      if (current.status === 'CF' || current.status === 'AP') {
        schedule.appointmentConfirmed += 1;
        continue;
      }
      if (current.status === 'SC') {
        schedule.appointmentScheduled += 1;
        continue;
      }

      if (current.status === 'AT') {
        schedule.appointmentAttended += 1;
        continue;
      }
    }

    const transactionData = await this.transactionsService.findAllByDate(
      startDate,
      endDate,
    );

    const transaction = {
      totalEntries: 0,
      totalExpenses: 0,
      parcialBalance: 0,
      expectedBalance: 0,
      pix: 0,
      creditCard: 0,
      debitCard: 0,
      boleto: 0,
      money: 0,
    };
    for (let index = 0; index < transactionData.length; index += 1) {
      const current = transactionData[index];

      if (current.paymentType === 'debito') {
        transaction.debitCard += Number(current.value);
      } else if (current.paymentType === 'pix') {
        transaction.pix += Number(current.value);
      } else if (current.paymentType === 'credito') {
        transaction.creditCard += Number(current.value);
      } else if (current.paymentType === 'boleto') {
        transaction.boleto += Number(current.value);
      } else if (current.paymentType === 'dinheiro') {
        transaction.money += Number(current.value);
      }

      if (current.type === 'R' && current.isPaid) {
        transaction.totalEntries += Number(current.value);
        continue;
      }
      if (current.type === 'E') {
        transaction.totalExpenses += Number(current.value);
        continue;
      }

      if (!current.paymentType) {
        continue;
      }
    }

    transaction.parcialBalance =
      transaction.totalEntries - transaction.totalExpenses;
    transaction.expectedBalance = transaction.parcialBalance;
    const budgetIds = transactionData
      .filter((element) => element.isPaid === true)
      .map((element) => element.entityId);
    const paymentsData = await this.budgetService.findAllByIds(budgetIds);
    for (let index = 0; index < paymentsData.length; index += 1) {
      const current = paymentsData[index];

      console.log('TRANSACTIONS', current);

      const value = transactionData.find(
        (element) => element.entityId === current.id,
      ).value;
      // if (current?.payment?.paymentType === 'debito') {
      //   transaction.debitCard += Number(value);
      // }
      // if (current?.payment?.paymentType === 'credito') {
      //   transaction.creditCard += Number(value);
      // }
      // if (current?.payment?.paymentType === 'boleto') {
      //   transaction.boleto += Number(value);
      // }
      // if (current?.payment?.paymentType === 'dinheiro') {
      //   transaction.money += Number(value);
      // }
      // if (current?.payment?.paymentType === 'pix') {
      //   transaction.pix += Number(value);
      // }
    }

    const budgets = {
      approved: 0,
      approvedValue: 0,
      approvedMediumValue: 0,
      rejected: 0,
      rejectedValue: 0,
      rejectedMediumValue: 0,
      open: 0,
      openValue: 0,
      openMediumValue: 0,
    };

    const budgetsData = await this.budgetService.findAllByDate(
      startDate,
      endDate,
    );

    for (let index = 0; index < budgetsData.length; index += 1) {
      const current = budgetsData[index];
      if (current.status === 'A') {
        budgets.approved += 1;
        budgets.approvedValue += Number(current.total);
        budgets.approvedMediumValue = budgets.approvedValue / budgets.approved;
        continue;
      }
      if (current.status === 'O') {
        budgets.open += 1;
        budgets.openValue += Number(current.total);
        budgets.openMediumValue = budgets.openValue / budgets.open;
        continue;
      }
      if (current.status === 'R') {
        budgets.rejected += 1;
        budgets.rejectedValue += Number(current.total);
        budgets.rejectedMediumValue = budgets.rejectedValue / budgets.rejected;
        continue;
      }
    }

    return { schedule, transaction, budgets };
  }

  async findAll() {
    return await this.reportModel.findAll({
      where: {
        accountId: this.tenantService.tenant.id,
      },
      include: [
        {
          model: this.financialModel,
          attributes: ['id', 'name', 'phone'],
        },
      ],
      order: [['created_at', 'DESC']],
    });
  }
}
