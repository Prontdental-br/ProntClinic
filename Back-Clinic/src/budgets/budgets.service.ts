/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Scope,
} from '@nestjs/common';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { Budget, StatusEnum } from './entities/budget.entity';
import { TenantService } from 'src/tenant/tenant/tenant.service';
import { BudgetItem } from 'src/budget-items/entities/budget-item.entity';
import { Sequelize } from 'sequelize-typescript';
import { Plan } from 'src/plan/entities/plan.entity';
import { Professional } from 'src/professionals/entities/professional.entity';
import { Patient } from 'src/patients/entities/patient.entity';
import { Treatment } from 'src/treatments/entities/treatment.entity';
import { Clinic } from 'src/clinics/entities/clinic.entity';
import { Payment } from 'src/payment/entities/payment.entity';
import { Op } from 'sequelize';
import * as moment from 'moment';
import { Transaction } from 'src/transactions/entities/transaction.entity';
import { Taxes } from 'src/taxes/entities/taxes.entity';
import { SendEmailBudgetDto } from './dto/send-email-budget.dto';
import { ConfigService } from '@nestjs/config';
import { sendEmail } from 'src/utils/sendEmail';
import { TenantModel } from 'src/common/decorators/tenant.decorators';
import { TenantModelService } from 'src/tenant/tenant/tenant.serviceModel';
import { SchemasReference } from 'src/schemas_references/entities/schemas_reference.entity';
import { Account } from 'src/accounts/entities/account.entity';

@Injectable({ scope: Scope.REQUEST })
export class BudgetsService {
  constructor(
    private sequelize: Sequelize,
    private configService: ConfigService,
    private tenantService: TenantService,
    private tenantModelService: TenantModelService,
  ) {}

  @TenantModel(Budget)
  private budgetModel: typeof Budget;

  @TenantModel(Clinic)
  private readonly clinicModel: typeof Clinic;

  @TenantModel(BudgetItem)
  private budgetItemModel: typeof BudgetItem;

  @TenantModel(Transaction)
  private transactionModel: typeof Transaction;

  @TenantModel(Patient)
  private patientModel: typeof Patient;

  @TenantModel(Taxes)
  private readonly taxesModel: typeof Taxes;

  @TenantModel(Professional)
  private readonly professionalModel: typeof Professional;

  @TenantModel(Plan)
  private readonly planModel: typeof Plan;

  @TenantModel(Payment)
  private readonly paymentModel: typeof Payment;

  @TenantModel(Treatment)
  private readonly treatmentModel: typeof Treatment;

  shouldMarkAsPaidAuto(budgetPaid: boolean, dueDate: Date): boolean {
    if (!budgetPaid) return false;
    const today = new Date();
    return (
      dueDate.getFullYear() === today.getFullYear() &&
      dueDate.getMonth() === today.getMonth() &&
      dueDate.getDate() <= today.getDate()
    );
  }

  async create(createBudgetDto: CreateBudgetDto) {
    const atomic = await this.sequelize.transaction();

    try {
      const budget = await this.budgetModel.create(
        {
          ...createBudgetDto,
          accountId: this.tenantService.tenant.id,
        },
        { transaction: atomic },
      );

      await Promise.all(
        createBudgetDto.items.map(async (budgetItem) => {
          await this.budgetItemModel.create(
            {
              ...budgetItem,
              accountId: this.tenantService.tenant.id,
              budgetId: budget.id,
            },
            { transaction: atomic },
          );
        }),
      );

      const referenceDate = new Date(budget.date);
      referenceDate.setHours(referenceDate.getHours() + 4);

      const patient = await this.patientModel.findByPk(budget.patientId);

      if (budget.downPayment > 0 && budget.downPaymentInstallments > 0) {
        const dpInstallments = budget.downPaymentInstallments || 1;
        const dpValue = Number(
          (budget.downPayment / dpInstallments).toFixed(2),
        );

        for (let i = 0; i < dpInstallments; i++) {
          const installmentDate = moment(referenceDate).toDate();
          const method = budget.downPaymentMethods?.[i] || null;

          const isPaid = this.shouldMarkAsPaidAuto(
            budget.budgetPaid,
            installmentDate,
          );

          const transaction = await this.transactionModel.create(
            {
              accountId: this.tenantService.tenant.id,
              type: 'R',
              value: dpValue,
              entityId: budget.id,
              description: `Entrada ${i + 1} - ${patient.name} : ${
                budget.description
              } `,
              referenceDate: installmentDate,
              dueDate: installmentDate,
              paymentMethod: method,
              paymentType: isPaid ? method : null,
              paymentDate: isPaid ? installmentDate : null,
              isPaid,
            },
            { transaction: atomic },
          );

          await SchemasReference.create(
            {
              accountId: this.tenantService.tenant.id,
              id_reference: transaction.id,
              id_schema: this.tenantService.tenant.idSeq,
              type: 'transactions',
            },
            { transaction: atomic },
          );
        }
      }

      if (budget.installments > 0) {
        const remainingAmount =
          budget.subtotal - budget.discount - budget.downPayment;
        const installmentValue = Number(
          (remainingAmount / budget.installments).toFixed(2),
        );

        for (let index = 0; index < budget.installments; index++) {
          const installmentDate = moment(referenceDate)
            .add(index + 1, 'M')
            .toDate();
          const method = budget.installmentsMethods?.[index] || null;

          const isPaid = this.shouldMarkAsPaidAuto(
            budget.budgetPaid,
            installmentDate,
          );

          const transaction = await this.transactionModel.create(
            {
              accountId: this.tenantService.tenant.id,
              type: 'R',
              value: installmentValue,
              entityId: budget.id,
              description: `Parcela ${index + 1} - ${patient.name} : ${
                budget.description
              }`,
              referenceDate: installmentDate,
              dueDate: installmentDate,
              paymentMethod: method,
              paymentDate: isPaid ? installmentDate : null,
              paymentType: isPaid ? method : null,
              isPaid,
            },
            { transaction: atomic },
          );

          await SchemasReference.create(
            {
              accountId: this.tenantService.tenant.id,
              id_reference: transaction.id,
              id_schema: this.tenantService.tenant.idSeq,
              type: 'transactions',
            },
            { transaction: atomic },
          );
        }
      } else {
        const total = budget.subtotal - budget.discount || 0;

        console.log(total);

        const transaction = await this.transactionModel.create(
          {
            accountId: this.tenantService.tenant.id,
            type: 'R',
            value: total,
            entityId: budget.id,
            description: patient.name + ' : ' + budget.description,
            referenceDate,
            dueDate: referenceDate,
          },
          { transaction: atomic },
        );

        await SchemasReference.create(
          {
            accountId: this.tenantService.tenant.id,
            id_reference: transaction.id,
            id_schema: this.tenantService.tenant.idSeq,
            type: 'transactions',
          },
          { transaction: atomic },
        );
      }

      await SchemasReference.create(
        {
          accountId: this.tenantService.tenant.id,
          id_reference: budget.id,
          id_schema: this.tenantService.tenant.idSeq,
          type: 'budgets',
        },
        { transaction: atomic },
      );

      await atomic.commit();
      return budget;
    } catch (error) {
      await atomic.rollback();
      throw error;
    }
  }

  findAll(limit?: number, offset?: number) {
    return this.budgetModel.findAll({
      where: {
        account_id: this.tenantService.tenant.id,
        active: true,
      },
      include: [
        {
          model: this.patientModel,
          attributes: ['id', 'name', 'cellPhone', 'cpf'],
        },
        // {
        //   model: this.paymentModel,
        //   required: false,
        //   as: 'payment',
        // },
      ],
      order: [['updated_at', 'DESC']],
      ...(limit && {
        limit,
      }),
      ...(offset && {
        offset,
      }),
    });
  }

  async findBudgetsSales() {
    const budgets = await this.budgetModel.findAll({
      where: {
        account_id: this.tenantService.tenant.id,
        active: true,
      },
      include: [
        {
          model: this.patientModel,
          attributes: ['id', 'name', 'cellPhone', 'cpf'],
        },
      ],
      order: [['updated_at', 'DESC']],
    });

    const budgetIds = budgets.map((b) => b.id);

    const transactions = await this.transactionModel.findAll({
      where: {
        entityId: budgetIds,
      },
      attributes: ['entityId', 'isPaid', 'type'],
    });

    const transactionMap = transactions.reduce((acc, transaction) => {
      if (transaction.type !== 'R') return acc;

      if (!acc[transaction.entityId]) {
        acc[transaction.entityId] = [];
      }

      acc[transaction.entityId].push(transaction.isPaid);
      return acc;
    }, {} as Record<string, boolean[]>);

    return budgets.map((budget) => {
      const allPaid =
        transactionMap[budget.id]?.length > 0 &&
        transactionMap[budget.id].every((isPaid) => isPaid);

      return {
        ...budget.toJSON(),
        status: allPaid ? 'P' : budget.status,
      };
    });
  }

  findAllByIds(idsArray: string[]) {
    const data = this.budgetModel.findAll({
      where: {
        id: {
          [Op.in]: idsArray,
        },
      },
      // include: [
      //   {
      //     model: this.paymentModel,
      //   },
      // ],
    });
    return data;
  }

  findAllByDate(startDate: Date, endDate: Date) {
    const data = this.budgetModel.findAll({
      where: {
        [Op.and]: [
          Sequelize.where(Sequelize.cast(Sequelize.col('date'), 'date'), {
            [Op.between]: [startDate, endDate],
          }),
          { account_id: this.tenantService.tenant.id, active: true },
        ],
      },
    });
    return data;
  }

  listOpenBudget(days?: number) {
    const daylimit = moment(new Date()).subtract(days, 'days').startOf('day');

    return this.budgetModel.findAll({
      where: {
        account_id: this.tenantService.tenant.id,
        status: 'O',
        active: true,
        ...(days && {
          created_at: {
            [Op.gt]: daylimit,
          },
        }),
      },
      include: [
        {
          model: this.patientModel,
          attributes: ['id', 'name', 'cellPhone', 'cpf'],
        },
        // {
        //   model: this.paymentModel,
        //   as: 'payment',
        // },
      ],
      order: [['created_at', 'DESC']],
    });
  }

  async graphBarsValue(yr?: number) {
    const year = yr || new Date().getFullYear();

    let result = await this.budgetModel.findAll({
      attributes: [
        [
          Sequelize.fn('DATE_TRUNC', 'month', Sequelize.col('updated_at')),
          'month',
        ],
        [Sequelize.fn('SUM', Sequelize.col('total')), 'total'],
      ],
      where: {
        status: 'A',
        active: true,
        updated_at: {
          [Op.between]: [`${year}-01-01`, `${year}-12-31`],
        },
      },
      group: [Sequelize.fn('DATE_TRUNC', 'month', Sequelize.col('updated_at'))],
      raw: true,
    });

    let totalByMonth = result.reduce((acc: any, item: any, index: number) => {
      acc[index] = item.total || 0;
      return acc;
    }, {});

    let data = Array.from(
      { length: 12 },
      (_, index) => parseFloat(totalByMonth[index]) || 0,
    );

    let formattedResult = [
      {
        label: 'Orçamentos Aprovados',
        data,
        backgroundColor: '#3f51b5',
      },
    ];

    result = await this.budgetModel.findAll({
      attributes: [
        [
          Sequelize.fn('DATE_TRUNC', 'month', Sequelize.col('updated_at')),
          'month',
        ],
        [Sequelize.fn('SUM', Sequelize.col('total')), 'total'],
      ],
      where: {
        status: 'O',
        updated_at: {
          [Op.between]: [`${year}-01-01`, `${year}-12-31`],
        },
      },
      group: [Sequelize.fn('DATE_TRUNC', 'month', Sequelize.col('updated_at'))],
      raw: true,
    });

    totalByMonth = result.reduce((acc: any, item: any, index: number) => {
      acc[index] = item.total || 0;
      return acc;
    }, {});

    data = Array.from(
      { length: 12 },
      (_, index) => parseFloat(totalByMonth[index]) || 0,
    );

    formattedResult = [
      ...formattedResult,
      {
        label: 'Orçamentos Abertos',
        data,
        backgroundColor: '#ff9800',
      },
    ];

    result = await this.budgetModel.findAll({
      attributes: [
        [
          Sequelize.fn('DATE_TRUNC', 'month', Sequelize.col('updated_at')),
          'month',
        ],
        [Sequelize.fn('SUM', Sequelize.col('total')), 'total'],
      ],
      where: {
        status: 'R',
        active: true,
        updated_at: {
          [Op.between]: [`${year}-01-01`, `${year}-12-31`],
        },
      },
      group: [Sequelize.fn('DATE_TRUNC', 'month', Sequelize.col('updated_at'))],
      raw: true,
    });

    totalByMonth = result.reduce((acc: any, item: any, index: number) => {
      acc[index] = item.total || 0;
      return acc;
    }, {});

    data = Array.from(
      { length: 12 },
      (_, index) => parseFloat(totalByMonth[index]) || 0,
    );

    formattedResult = [
      ...formattedResult,
      {
        label: 'Orçamentos Reprovados',
        data,
        backgroundColor: '#f44336',
      },
    ];

    return formattedResult;
  }

  async graphBarsQt(yr?: number) {
    const year = yr || new Date().getFullYear();

    let result = await this.budgetModel.findAll({
      attributes: [
        [
          Sequelize.fn('DATE_TRUNC', 'month', Sequelize.col('updated_at')),
          'month',
        ],
        [Sequelize.fn('COUNT', Sequelize.col('*')), 'count'],
      ],
      where: {
        status: 'A',
        active: true,
        updated_at: {
          [Op.between]: [`${year}-01-01`, `${year}-12-31`],
        },
      },
      group: [Sequelize.fn('DATE_TRUNC', 'month', Sequelize.col('updated_at'))],
      raw: true,
    });

    let countByMonth = result.reduce((acc: any, item: any, index: number) => {
      acc[index] = item.count;
      return acc;
    }, {});

    let data = Array.from(
      { length: 12 },
      (_, index) => parseInt(countByMonth[index]) || 0,
    );

    let formattedResult = [
      {
        label: 'Orçamentos Aprovados',
        data,
        backgroundColor: '#3f51b5',
      },
    ];

    result = await this.budgetModel.findAll({
      attributes: [
        [
          Sequelize.fn('DATE_TRUNC', 'month', Sequelize.col('updated_at')),
          'month',
        ],
        [Sequelize.fn('COUNT', Sequelize.col('*')), 'count'],
      ],
      where: {
        status: 'O',
        updated_at: {
          [Op.between]: [`${year}-01-01`, `${year}-12-31`],
        },
      },
      group: [Sequelize.fn('DATE_TRUNC', 'month', Sequelize.col('updated_at'))],
      raw: true,
    });

    countByMonth = result.reduce((acc: any, item: any, index: number) => {
      acc[index] = item.count;
      console.log(item.month, item.count);
      return acc;
    }, {});

    data = Array.from(
      { length: 12 },
      (_, index) => parseInt(countByMonth[index]) || 0,
    );

    formattedResult = [
      ...formattedResult,
      {
        label: 'Orçamentos Abertos',
        data,
        backgroundColor: '#ff9800',
      },
    ];

    result = await this.budgetModel.findAll({
      attributes: [
        [
          Sequelize.fn('DATE_TRUNC', 'month', Sequelize.col('updated_at')),
          'month',
        ],
        [Sequelize.fn('COUNT', Sequelize.col('*')), 'count'],
      ],
      where: {
        status: 'R',
        updated_at: {
          [Op.between]: [`${year}-01-01`, `${year}-12-31`],
        },
      },
      group: [Sequelize.fn('DATE_TRUNC', 'month', Sequelize.col('updated_at'))],
      raw: true,
    });

    countByMonth = result.reduce((acc: any, item: any, index: number) => {
      acc[index] = item.count;
      console.log(item.month, item.count);
      return acc;
    }, {});

    data = Array.from(
      { length: 12 },
      (_, index) => parseInt(countByMonth[index]) || 0,
    );

    formattedResult = [
      ...formattedResult,
      {
        label: 'Orçamentos Reprovados',
        data,
        backgroundColor: '#f44336',
      },
    ];

    return formattedResult;
  }

  async totalByProfessional(days?: number) {
    const daylimit = moment(new Date()).subtract(days, 'days').startOf('day');

    const paidTransactions = await this.transactionModel.findAll({
      where: {
        active: true,
        isPaid: true,
        isParent: false,
        type: 'R',
        accountId: this.tenantService.tenant.id,
        entityId: { [Op.ne]: null },
        ...(days && {
          createdAt: {
            [Op.gt]: daylimit,
          },
        }),
      },
      attributes: [
        'id',
        'description',
        'value',
        'entityId',
        'created_at',
        'paymentDate',
      ],
      raw: true,
    });

    if (paidTransactions.length === 0) return [];

    const budgetIds = paidTransactions.map((t) => t.entityId).filter(Boolean);

    const budgets = await this.budgetModel.findAll({
      where: {
        id: { [Op.in]: budgetIds },
        active: true,
        accountId: this.tenantService.tenant.id,
      },
      attributes: ['id', 'total', 'professionalId'],
      include: [
        {
          model: this.professionalModel,
          as: 'professional',
          attributes: ['id', 'name', 'commissionValue', 'commissionType'],
        },
      ],
      raw: true,
    });

    const budgetMap = budgets.reduce((acc, b) => {
      acc[b['id']] = b;
      return acc;
    }, {} as Record<string, any>);

    const result = paidTransactions.map((t) => {
      const budget = budgetMap[t.entityId];

      if (!budget) {
        return {
          transactionId: t.id,
          description: t.description,
          transactionValue: t.value || 0,
          receivable: 0,
          professionalId: null,
          professionalName: 'Profissional não encontrado',
          commissionType: null,
          commissionValue: 0,
          createdAt: t.createdAt,
        };
      }

      const commissionType = budget['professional.commissionType'];
      const commissionValue =
        parseFloat(budget['professional.commissionValue']) || 0;
      const transactionValue = t.value || 0;

      let receivable = 0;
      if (commissionType === 'porcentagem') {
        receivable = (transactionValue * commissionValue) / 100;
      } else if (commissionType === 'valor') {
        receivable = commissionValue;
      }

      return {
        transactionId: t.id,
        description: t.description,
        transactionValue,
        receivable,
        professionalId: budget['professional.id'],
        professionalName: budget['professional.name'],
        commissionType,
        commissionValue,
        entityId: t.entityId,
        paymentDate: t.paymentDate,
        createdAt: t.createdAt,
      };
    });

    return result;
  }

  async totalAll(days?: number) {
    const daylimit = moment(new Date()).subtract(days, 'days').startOf('day');

    const where: any = {
      type: 'R',
      isPaid: true,
      active: true,
      accountId: this.tenantService.tenant.id,
    };

    if (days) {
      where.createdAt = {
        [Op.gt]: daylimit,
      };
    }

    const transactions = await this.transactionModel.findAll({
      where,
      attributes: ['value'],
      raw: true,
    });

    const total = transactions.reduce(
      (acc, curr) => acc + Number(curr.value || 0),
      0,
    );

    return { total };
  }

  async totalAllByDate(startDate: Date, endDate: Date) {
    const total = await this.transactionModel.sum('value', {
      where: {
        type: 'R',
        isPaid: true,
        active: true,
        accountId: this.tenantService.tenant.id,
        updated_at: {
          [Op.between]: [startDate, endDate],
        },
      },
    });

    return { total: total || 0 };
  }

  async totalAllOpen(days?: number) {
    const daylimit = moment(new Date()).subtract(days, 'days').startOf('day');

    const total = await this.budgetModel.sum('total', {
      where: {
        account_id: this.tenantService.tenant.id,
        status: 'O',
        active: true,
        ...(days && {
          created_at: {
            [Op.gt]: daylimit,
          },
        }),
      },
    });

    const discountTotal = await this.budgetModel.sum('discount', {
      where: {
        account_id: this.tenantService.tenant.id,
        status: 'O',
        ...(days && {
          created_at: {
            [Op.gt]: daylimit,
          },
        }),
      },
    });

    return { total: total - (discountTotal || 0) };
  }

  async totalByPlan(days?: number) {
    const daylimit = moment(new Date()).subtract(days, 'days').startOf('day');

    const budgets = await this.budgetModel.findAll({
      where: {
        accountId: this.tenantService.tenant.id,
        active: true,
        ...(days && {
          createdAt: {
            [Op.gt]: daylimit,
          },
        }),
      },
      attributes: ['id', 'planId', 'total'],
      include: [
        {
          model: this.planModel,
          as: 'plan',
          attributes: ['id', 'name'],
        },
      ],
      raw: false,
    });

    const budgetIds = budgets.map((b) => b.id);

    const paidTransactions = await this.transactionModel.findAll({
      where: {
        entityId: { [Op.in]: budgetIds },
        isPaid: true,
        accountId: this.tenantService.tenant.id,
        ...(days && {
          createdAt: {
            [Op.gt]: daylimit,
          },
        }),
      },
      attributes: ['entityId'],
      raw: true,
    });

    const paidBudgetIds = new Set(paidTransactions.map((t) => t.entityId));

    const filteredBudgets = budgets.filter((b) => paidBudgetIds.has(b.id));

    const groupedByPlan = filteredBudgets.reduce((acc, budget) => {
      const planId = budget.planId || 'no-plan'; // or handle nulls separately if needed

      if (!acc[planId]) {
        acc[planId] = {
          planId: budget.planId,
          sumTotal: 0,
          plan: budget.plan || null,
        };
      }

      acc[planId].sumTotal += Number(budget.total || 0);

      return acc;
    }, {});

    return Object.values(groupedByPlan).map((item: any) => ({
      planId: item.planId,
      sumTotal: item.sumTotal.toFixed(2),
      plan: item.plan,
    }));
  }

  async findOne(id: string) {
    const schemaReference = await SchemasReference.findOne({
      where: {
        id_reference: id,
        type: 'budgets',
      },
    });

    if (!schemaReference) {
      throw new NotFoundException('Referência não encontrada');
    }

    const schemaName = `${process.env.NAME_SCHEMA_CLIENT}${schemaReference.id_schema}`;

    const BudgetModel = Budget.schema(schemaName);
    const PatientModel = Patient.schema(schemaName);
    const BudgetItemModel = BudgetItem.schema(schemaName);
    const TreatmentModel = Treatment.schema(schemaName);
    const ProfessionalModel = Professional.schema(schemaName);
    const PlanModel = Plan.schema(schemaName);
    const TransactionModel = Transaction.schema(schemaName);

    const ClinicModel = Clinic.schema(schemaName);

    let budget = await BudgetModel.findByPk(id, {
      rejectOnEmpty: true,
      include: [
        {
          model: PatientModel,
        },
        {
          model: BudgetItemModel,
          include: [
            {
              model: TreatmentModel,
            },
          ],
        },
        {
          model: ProfessionalModel,
        },
        {
          model: PlanModel,
        },
      ],
    });

    budget = budget.toJSON();

    const { accountId } = budget;

    const clinic = (
      await ClinicModel.findOne({
        where: { accountId },
        include: [{ model: Account, as: 'account' }],
      })
    ).toJSON();

    budget['clinic'] = clinic ?? null;

    const transactions = await TransactionModel.findAll({
      where: {
        accountId,
        isParent: false,
        entityId: id,
      },
      order: [['dueDate', 'ASC']],
    });

    budget['transactions'] = transactions?.map((t) => t.toJSON()) ?? [];

    return budget;
  }

  async sendBudgetToEmail(sendEmailBudgetFields: SendEmailBudgetDto) {
    const budget = await this.findOne(sendEmailBudgetFields.contractId);

    const patient = budget.patient.name;

    const subject = 'Assinatura Orçamento Clairis';

    const bodyMessage = `Olá, ${patient}, você possui um orçamento ${
      budget.description
    } para assinar
  
  Acesse o link abaixo e assine digitalmente.
  
  ${this.configService.get('URL_FRONT')}/budget/print/${budget.id}
  
  Clairis Software`;

    if (budget) {
      await sendEmail(sendEmailBudgetFields.email, subject, bodyMessage);
    }

    return budget;
  }

  async update(id: string, updateBudgetDto: UpdateBudgetDto) {
    return this.sequelize.transaction(async (transaction) => {
      const existingBudget = await this.budgetModel.findByPk(id, {
        transaction,
      });
      if (!existingBudget) {
        throw new NotFoundException('Orçamento não encontrado');
      }

      if (existingBudget.isSigned) {
        throw new BadRequestException(
          'Não é possível editar este orçamento, pois ele já está assinado.',
        );
      }

      const existingTransactions = await this.transactionModel.findAll({
        where: {
          entityId: id,
          accountId: this.tenantService.tenant.id,
          active: true,
        },
        transaction,
      });

      const hasPaidTransactions = existingTransactions.some((t) => t.isPaid);
      if (hasPaidTransactions) {
        throw new BadRequestException(
          'Não é possível editar este orçamento, pois há parcelas já pagas.',
        );
      }

      await this.budgetModel.update(
        { ...updateBudgetDto },
        {
          where: {
            id,
            account_id: this.tenantService.tenant.id,
          },
          transaction,
        },
      );

      await this.budgetItemModel.destroy({
        where: { budget_id: id },
        transaction,
      });

      if (updateBudgetDto.items?.length) {
        await Promise.all(
          updateBudgetDto.items.map((item) =>
            this.budgetItemModel.create(
              {
                ...item,
                accountId: this.tenantService.tenant.id,
                budgetId: id,
              },
              { transaction },
            ),
          ),
        );
      }

      await this.transactionModel.destroy({
        where: {
          entityId: id,
          accountId: this.tenantService.tenant.id,
        },
        transaction,
      });

      const updatedBudget = await this.budgetModel.findByPk(id, {
        transaction,
      });
      const patient = await this.patientModel.findByPk(
        updatedBudget.patientId,
        {
          transaction,
        },
      );

      const referenceDate = new Date(updatedBudget.date);
      referenceDate.setHours(referenceDate.getHours() + 4);

      if (
        updatedBudget.downPayment > 0 &&
        updatedBudget.downPaymentInstallments > 0
      ) {
        const dpInstallments = updatedBudget.downPaymentInstallments;
        const dpValue = Number(
          (updatedBudget.downPayment / dpInstallments).toFixed(2),
        );

        for (let i = 0; i < dpInstallments; i++) {
          const installmentDate = moment(referenceDate).toDate();
          const method = updatedBudget.downPaymentMethods?.[i] || null;

          const transactionC = await this.transactionModel.create(
            {
              accountId: this.tenantService.tenant.id,
              type: 'R',
              value: dpValue,
              entityId: id,
              description: `Entrada ${i + 1} - ${patient.name} : ${
                updatedBudget.description
              }`,
              referenceDate: installmentDate,
              dueDate: installmentDate,
              paymentMethod: method,
            },
            { transaction },
          );

          await SchemasReference.create(
            {
              accountId: this.tenantService.tenant.id,
              id_reference: transactionC.id,
              id_schema: this.tenantService.tenant.idSeq,
              type: 'transactions',
            },
            { transaction },
          );
        }
      }

      if (updatedBudget.installments > 0) {
        const remainingAmount =
          updatedBudget.subtotal -
          updatedBudget.discount -
          updatedBudget.downPayment;
        const installmentValue = Number(
          (remainingAmount / updatedBudget.installments).toFixed(2),
        );

        for (let i = 0; i < updatedBudget.installments; i++) {
          const installmentDate = moment(referenceDate)
            .add(i + 1, 'M')
            .toDate();
          const method = updatedBudget.installmentsMethods?.[i] || null;

          const transactionC = await this.transactionModel.create(
            {
              accountId: this.tenantService.tenant.id,
              type: 'R',
              value: installmentValue,
              entityId: id,
              description: `Parcela ${i + 1} - ${updatedBudget.description} : ${
                patient.name
              }`,
              referenceDate: installmentDate,
              dueDate: installmentDate,
              paymentMethod: method,
            },
            { transaction },
          );

          await SchemasReference.create(
            {
              accountId: this.tenantService.tenant.id,
              id_reference: transactionC.id,
              id_schema: this.tenantService.tenant.idSeq,
              type: 'transactions',
            },
            { transaction },
          );
        }
      } else {
        const total = updatedBudget.subtotal - updatedBudget.discount || 0;

        const transactionC = await this.transactionModel.create(
          {
            accountId: this.tenantService.tenant.id,
            type: 'R',
            value: total,
            entityId: id,
            description: `${patient.name} : ${updatedBudget.description}`,
            referenceDate,
            dueDate: referenceDate,
          },
          { transaction },
        );

        await SchemasReference.create(
          {
            accountId: this.tenantService.tenant.id,
            id_reference: transactionC.id,
            id_schema: this.tenantService.tenant.idSeq,
            type: 'transactions',
          },
          { transaction },
        );
      }

      return this.findOne(id);
    });
  }

  async updateStatus(id: string, status: StatusEnum) {
    const allowedStatuses = Object.values(StatusEnum);

    if (!allowedStatuses.includes(status)) {
      throw new BadRequestException(
        `Status inválido. Permitidos: ${allowedStatuses.join(', ')}`,
      );
    }

    await this.budgetModel.update(
      { status },
      {
        where: {
          id,
          account_id: this.tenantService.tenant.id,
        },
      },
    );
  }

  async openBudget(days: number) {
    const daylimit = moment(new Date()).subtract(days, 'days').startOf('day');
    return await this.budgetModel.findAll({
      where: {
        status: 'O',
        accountId: this.tenantService.tenant.id,
        created_at: {
          [Op.gt]: daylimit,
        },
      },
      raw: true,
    });
  }

  async remove(id: string) {
    await this.transactionModel.update(
      { active: false },
      {
        where: {
          entityId: id,
        },
      },
    );

    await this.budgetItemModel.update(
      { active: false },
      {
        where: {
          budgetId: id,
        },
      },
    );

    await this.budgetModel.update(
      { active: false, status: 'C' },
      {
        where: {
          id,
          account_id: this.tenantService.tenant.id,
        },
      },
    );

    // // Inativar referências (se também tiver campo active)
    // await SchemasReference.update(
    //   { active: false },
    //   {
    //     where: {
    //       id_reference: id,
    //       type: 'budgets',
    //     },
    //   },
    // );

    return {
      success: true,
      message: 'Orçamento e registros relacionados foram inativados.',
    };
  }

  async findByPatientId(patientId: string, limit?: number, offset?: number) {
    const budgets = await this.budgetModel.findAll({
      where: {
        account_id: this.tenantService.tenant.id,
        patient_id: patientId,
      },
      order: [['updated_at', 'DESC']],
      include: [
        {
          model: this.planModel,
          attributes: ['name'],
        },
        {
          model: this.professionalModel,
          attributes: ['name'],
        },
        {
          model: this.patientModel,
        },
        {
          model: this.budgetItemModel,
        },
      ],
      ...(limit && { limit }),
      ...(offset && { offset }),
    });

    const budgetIds = budgets.map((b) => b.id);
    const transactions = await this.transactionModel.findAll({
      where: {
        accountId: this.tenantService.tenant.id,
        entityId: budgetIds,
        active: true,
      },
      attributes: ['entityId', 'isPaid'],
    });

    const hasPaidMap = new Map<string, boolean>();
    for (const t of transactions) {
      if (t.isPaid) {
        hasPaidMap.set(t.entityId, true);
      }
    }

    const budgetsWithFlag = budgets.map((budget: any) => ({
      ...budget.get({ plain: true }),
      hasPaidTransaction: !!hasPaidMap.get(budget.id),
    }));

    return budgetsWithFlag;
  }

  async addPayment(id: string, paymentFields) {
    const { value, paymentType, paymentDate } = paymentFields;

    const objTransaction = await this.transactionModel.findByPk(id);

    if (!objTransaction) {
      console.error('Transaction not found');
      return;
    }

    let budget = null;
    if (objTransaction.entityId) {
      budget = await this.budgetModel.findByPk(objTransaction.entityId, {
        raw: true,
        include: [
          {
            model: this.patientModel,
            attributes: ['name'],
            as: 'patient',
          },
        ],
      });
    }

    const parentId = objTransaction.parent ?? objTransaction.id;

    if (value > 0) {
      await this.transactionModel.create({
        description: budget
          ? `Pagamento - ${budget['patient.name']} : ${budget.description}`
          : `Pagamento - ${objTransaction.description}`,
        value: value,
        type: objTransaction.type,
        isPaid: true,
        entityId: budget ? budget.id : null,
        referenceDate: new Date(),
        dueDate: new Date(),
        paymentType,
        paymentDate,
        parent: parentId,
        accountId: this.tenantService.tenant.id,
      });

      const transactions = await this.transactionModel.findAll({
        where: {
          parent: parentId,
          isPaid: true,
        },
      });

      const totalPaid = transactions.reduce(
        (acc, current) => acc + Number(current.value),
        0,
      );

      const remainingValue = objTransaction.value - value;

      await this.transactionModel.update(
        {
          value: remainingValue > 0 ? remainingValue : 0,
          isPaid: remainingValue <= 0,
        },
        {
          where: {
            id: parentId,
          },
        },
      );

      // if (budget) {
      //     await Payment.create({
      //         ...paymentFields,
      //         budgetId: budget.id,
      //         accountId: this.tenantService.tenant.id,
      //     });
      // }
    } else {
      await this.transactionModel.update(
        {
          isPaid: true,
          paymentDate,
          paymentType,
        },
        {
          where: {
            id: objTransaction.id,
          },
        },
      );
    }
  }

  async double(id: string) {
    const budget = await this.budgetModel.findByPk(id, {
      include: [
        {
          model: this.budgetItemModel,
        },
      ],
    });

    return await this.create({
      ...budget.dataValues,
      id: undefined,
      budgetItems: undefined,
      created_at: undefined,
      updated_at: undefined,
      description: `${budget.description} - Cópia`,
      items: budget.budgetItems.map((item) => {
        return {
          ...item.dataValues,
          id: null,
          budgetId: null,
          created_at: undefined,
          updated_at: undefined,
        };
      }),
    });
  }
}
