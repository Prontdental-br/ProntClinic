/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException, Scope } from '@nestjs/common';
import CreateTransactionDto from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { Transaction } from './entities/transaction.entity';
import { TenantService } from 'src/tenant/tenant/tenant.service';
import { Budget } from 'src/budgets/entities/budget.entity';
import sequelize from 'sequelize';
import { Op } from 'sequelize';
import * as moment from 'moment';
import { Patient } from 'src/patients/entities/patient.entity';
import { BudgetItem } from 'src/budget-items/entities/budget-item.entity';
import { Treatment } from 'src/treatments/entities/treatment.entity';
import { Professional } from 'src/professionals/entities/professional.entity';
import { Plan } from 'src/plan/entities/plan.entity';
import { Clinic } from 'src/clinics/entities/clinic.entity';
import { Account } from 'src/accounts/entities/account.entity';
import { TenantModel } from 'src/common/decorators/tenant.decorators';
import { TenantModelService } from 'src/tenant/tenant/tenant.serviceModel';
import { StatusLog } from 'src/status_logs/entities/status_log.entity';

@Injectable({ scope: Scope.REQUEST })
export class TransactionsService {
  constructor(
    private tenantService: TenantService,
    private tenantModelService: TenantModelService,
  ) {}

  @TenantModel(Transaction)
  private readonly transactionModel: typeof Transaction;

  @TenantModel(Budget)
  private readonly budgetModel: typeof Budget;

  @TenantModel(Patient)
  private readonly patientModel: typeof Patient;

  @TenantModel(BudgetItem)
  private readonly budgetItemModel: typeof BudgetItem;

  @TenantModel(Treatment)
  private readonly treatmentModel: typeof Treatment;

  @TenantModel(Professional)
  private readonly professionalModel: typeof Professional;

  @TenantModel(Plan)
  private readonly planModel: typeof Plan;

  @TenantModel(Clinic)
  private readonly clinicModel: typeof Clinic;

  @TenantModel(StatusLog)
  private readonly statusLogModel: typeof StatusLog;

  private formatToReferenceStyle(date: Date | string) {
    const d = new Date(date);
    d.setHours(d.getHours() + 1);
    return d;
  }

  async create(createTransactionDto: CreateTransactionDto) {
    const dueDate = this.formatToReferenceStyle(createTransactionDto.dueDate);

    const transaction = await this.transactionModel.create({
      ...createTransactionDto,
      accountId: this.tenantService.tenant.id,
      dueDate,
      referenceDate: dueDate,
    });

    return transaction;
  }

  findAllByDate(startDate: Date, endDate: Date) {
    return this.transactionModel.findAll({
      where: {
        accountId: this.tenantService.tenant.id,
        active: true,
        created_at: {
          [Op.between]: [startDate, endDate],
        },
      },
      order: [['created_at', 'DESC']],
    });
  }

  async findAll() {
    const transactions = await this.transactionModel.findAll({
      where: {
        accountId: this.tenantService.tenant.id,
        active: true,
        isParent: false,
      },
      order: [['created_at', 'DESC']],
    });

    if (!transactions.length) return [];

    const entityIds = transactions.map((t) => t.entityId).filter(Boolean);

    const budgets = await this.budgetModel.findAll({
      where: { id: entityIds },
      attributes: ['id', 'budgetPaid', 'isSigned', 'status'],
    });

    const budgetMap = budgets.reduce((map, budget) => {
      map[budget.id] = {
        budgetPaid: budget.budgetPaid,
        isSigned: budget.isSigned,
        statusBudget: budget.status,
      };
      return map;
    }, {} as Record<string, { budgetPaid: boolean; isSigned: boolean; statusBudget: string }>);

    const today = new Date();
    const updatedTransactions: Promise<any>[] = [];

    for (const t of transactions) {
      const b = budgetMap[t.entityId];
      if (b?.budgetPaid && !t.isPaid) {
        const dueDate = new Date(t.dueDate);

        const shouldBePaid =
          dueDate.getFullYear() === today.getFullYear() &&
          dueDate.getMonth() === today.getMonth() &&
          dueDate.getDate() <= today.getDate();

        if (shouldBePaid) {
          t.isPaid = true;

          updatedTransactions.push(
            this.transactionModel.update(
              {
                isPaid: true,
                paymentDate: t.referenceDate,
                paymentType: t.paymentMethod,
              },
              { where: { id: t.id } },
            ),
          );
        }
      }
    }

    if (updatedTransactions.length > 0) {
      await Promise.all(updatedTransactions);
    }

    let result = transactions.map((t) => {
      const data = t.toJSON();
      return {
        ...data,
        isSigned: budgetMap[data.entityId]?.isSigned || null,
        statusBudget: budgetMap[data.entityId]?.statusBudget || null,
      };
    });

    result = result.filter((t) => {
      if (t.type === 'R' && t.entityId) {
        return t.statusBudget === 'A' || t.statusBudget === 'P';
      }
      return true;
    });

    return result;
  }

  async findAllAccountsReceivable() {
    const transactions = await this.transactionModel.findAll({
      where: {
        accountId: this.tenantService.tenant.id,
        active: true,
        isParent: false,
        type: 'R',
      },
      order: [['created_at', 'DESC']],
    });

    if (!transactions.length) return [];

    return transactions;
  }
  async findAllAccountsPayable() {
    const transactions = await this.transactionModel.findAll({
      where: {
        accountId: this.tenantService.tenant.id,
        active: true,
        isParent: false,
        type: 'E',
      },
      order: [['created_at', 'DESC']],
    });

    if (!transactions.length) return [];

    return transactions;
  }

  async findAllTransactionsKanban() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const transactions = await this.transactionModel.findAll({
        where: {
          accountId: this.tenantService.tenant.id,
          active: true,
          isParent: false,
          dueDate: {
            [Op.lt]: today,
          },
        },
        order: [['dueDate', 'ASC']],
      });

      const transactionIds = transactions.map((t) => t.id);
      const budgetIds = [...new Set(transactions.map((t) => t.entityId))];

      const budgets = await this.budgetModel.findAll({
        where: { id: budgetIds },
        attributes: ['id', 'patientId'],
      });

      const patientIds = [...new Set(budgets.map((b) => b.patientId))];

      const patients = await this.patientModel.findAll({
        where: { id: patientIds },
        attributes: ['id', 'name', 'cellPhone'],
      });

      const budgetMap = Object.fromEntries(budgets.map((b) => [b.id, b]));
      const patientMap = Object.fromEntries(patients.map((p) => [p.id, p]));

      const statusLogs = await this.statusLogModel.findAll({
        where: {
          entityId: transactionIds,
          type: 'transaction',
        },
        order: [['created_at', 'ASC']],
      });

      const logsByTransaction = statusLogs.reduce((acc, log) => {
        if (!acc[log.entityId]) acc[log.entityId] = [];
        acc[log.entityId].push(log);
        return acc;
      }, {} as Record<string, typeof statusLogs>);

      const grouped = {
        'Parcela Vencida': [],
        'Contato Realizado': [],
        Renegociação: [],
      };

      for (const tx of transactions) {
        const logs = logsByTransaction[tx.id] || [];
        const budget = budgetMap[tx.entityId];
        const patient = budget ? patientMap[budget.patientId] : null;

        const card = {
          id: tx.id,
          description: tx.description,
          value: tx.value,
          dueDate: tx.dueDate,
          patientName: patient?.name || 'Paciente não encontrado',
          patientPhone: patient?.cellPhone || null,
        };

        const teveContato = logs.some((l) => l.status === 'in_progress');
        const foiRenegociado = logs.some((l) => l.status === 'won');

        if (foiRenegociado && tx.isPaid) {
          // renegociado e pago → Renegociação
          grouped['Renegociação'].push(card);
        } else if (!tx.isPaid && teveContato) {
          // ainda não pago e teve contato → Contato Realizado
          grouped['Contato Realizado'].push(card);
        } else if (!tx.isPaid && tx.dueDate < today) {
          // ainda não pago e vencido → Parcela Vencida
          grouped['Parcela Vencida'].push(card);
        }
      }

      return grouped;
    } catch (error) {
      console.error('Erro ao buscar transações para Kanban:', error);
      return {
        'Parcela Vencida': [],
        'Contato Realizado': [],
        Renegociação: [],
      };
    }
  }

  async updateTransactionStatus(id: string, status: 'in_progress' | 'won') {
    const tx = await this.transactionModel.findByPk(id);
    if (!tx) throw new NotFoundException('Transação não encontrada');

    if (status === 'won') {
      await tx.update({
        isPaid: true,
        paymentType: 'dinheiro',
        paymentDate: new Date(),
      });
    }

    await this.statusLogModel.create({
      entityId: id,
      type: 'transaction',
      status,
      createdAt: new Date(),
    });

    return { message: `Status ${status} registrado com sucesso.` };
  }

  findOne(id: string) {
    return this.transactionModel.findOne({
      where: {
        id,
        accountId: this.tenantService.tenant.id,
      },
    });
  }

  async getDebt(id: string) {
    const transaction = await this.transactionModel.findOne({
      where: {
        id,
        accountId: this.tenantService.tenant.id,
        active: true,
      },
    });

    let budget = await this.budgetModel.findOne({
      where: {
        id: transaction?.entityId,
      },
      rejectOnEmpty: true,
      include: [
        {
          model: this.patientModel,
        },
        {
          model: this.budgetItemModel,
          include: [
            {
              model: this.treatmentModel,
            },
          ],
        },
        {
          model: this.professionalModel,
        },
        {
          model: this.planModel,
        },
        // {
        //   model: Payment,
        //   as: 'payment',
        // },
      ],
    });

    budget = budget.toJSON();

    const { accountId } = budget;
    const clinic = (
      await this.clinicModel.findOne({
        where: { accountId },
        include: [
          {
            model: Account,
            attributes: ['cellPhone'],
          },
        ],
      })
    ).toJSON();
    budget['clinic'] = clinic;

    return { transaction, budget };
  }

  update(id: string, updateTransactionDto: UpdateTransactionDto) {
    return this.transactionModel.update(
      {
        ...updateTransactionDto,
      },
      {
        where: {
          id: id,
          accountId: this.tenantService.tenant.id,
          active: true,
        },
      },
    );
  }

  remove(id: string) {
    return this.transactionModel.destroy({
      where: {
        id: id,
        accountId: this.tenantService.tenant.id,
      },
    });
  }

  async overdueDebt(days: number) {
    const day = moment(new Date()).startOf('day');
    const daylimit = moment(new Date()).subtract(days, 'days').startOf('day');

    const value = await this.transactionModel.findAll({
      attributes: [[sequelize.fn('sum', sequelize.col('value')), 'total']],
      where: {
        accountId: this.tenantService.tenant.id,
        isPaid: false,
        active: true,
        dueDate: {
          [Op.lt]: day,
        },
        created_at: {
          [Op.gt]: daylimit,
        },
      },
    });
    return value ? value : 0;
  }

  async overdueDebtList() {
    const day = moment(new Date(), 'YYYY-MM-DD').utc().startOf('day');
    return await this.transactionModel.findAll({
      where: {
        accountId: this.tenantService.tenant.id,
        isPaid: false,
        active: true,
        dueDate: {
          [Op.lt]: day,
        },
      },
    });
  }

  async getPatientTransactions(id: string) {
    const budgets = await this.budgetModel.findAll({
      where: { patientId: id },
      attributes: ['id', 'budgetPaid', 'isSigned', 'status'],
    });

    if (!budgets.length) return [];

    const budgetMap = budgets.reduce((map, budget) => {
      map[budget.id] = {
        budgetPaid: budget.budgetPaid,
        isSigned: budget.isSigned,
        status: budget.status,
      };
      return map;
    }, {} as Record<string, { budgetPaid: boolean; isSigned: boolean; status: string }>);

    const budgetIds = Object.keys(budgetMap);

    const transactions = await this.transactionModel.findAll({
      where: {
        entityId: budgetIds,
        active: true,
        isParent: false,
        accountId: this.tenantService.tenant.id,
      },
      order: [['created_at', 'DESC']],
    });

    if (!transactions.length) return [];

    const today = new Date();
    const updatedTransactions: Promise<any>[] = [];

    for (const t of transactions) {
      const b = budgetMap[t.entityId];
      if (b?.budgetPaid && !t.isPaid) {
        const dueDate = new Date(t.dueDate);

        const shouldBePaid =
          dueDate.getFullYear() === today.getFullYear() &&
          dueDate.getMonth() === today.getMonth() &&
          dueDate.getDate() <= today.getDate();

        if (shouldBePaid) {
          t.isPaid = true;

          updatedTransactions.push(
            this.transactionModel.update(
              {
                isPaid: true,
                paymentDate: t.referenceDate,
                paymentType: t.paymentMethod,
              },
              { where: { id: t.id } },
            ),
          );
        }
      }
    }

    if (updatedTransactions.length > 0) {
      await Promise.all(updatedTransactions);
    }

    return transactions.map((t) => {
      const data = t.toJSON();
      return {
        ...data,
        isSigned: budgetMap[data.entityId]?.isSigned || null,
        status: budgetMap[data.entityId]?.status || null,
      };
    });
  }
}
