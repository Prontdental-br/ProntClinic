/* eslint-disable prettier/prettier */
import { Injectable, Scope } from '@nestjs/common';
import { CreateBudgetItemDto } from './dto/create-budget-item.dto';
import { UpdateBudgetItemDto } from './dto/update-budget-item.dto';
import { InjectModel } from '@nestjs/sequelize';
import { BudgetItem } from './entities/budget-item.entity';
import { TenantService } from 'src/tenant/tenant/tenant.service';
import sequelize from 'sequelize';
import { Budget, StatusEnum } from 'src/budgets/entities/budget.entity';
import { Op } from 'sequelize';
import * as moment from 'moment';
import { Treatment } from 'src/treatments/entities/treatment.entity';
import { Plan } from 'src/plan/entities/plan.entity';
import { TenantModel } from 'src/common/decorators/tenant.decorators';
import { TenantModelService } from 'src/tenant/tenant/tenant.serviceModel';

@Injectable({ scope: Scope.REQUEST })
export class BudgetItemsService {
  constructor(
    private tenantService: TenantService,
    private tenantModelService: TenantModelService,
  ) {}

  @TenantModel(BudgetItem)
  private readonly budgetItemsModel: typeof BudgetItem;

  @TenantModel(Budget)
  private readonly budgetModel: typeof Budget;

  @TenantModel(Treatment)
  private readonly treatmentModel: typeof Treatment;

  @TenantModel(Plan)
  private readonly planModel: typeof Plan;

  create(createBudgetItemDto: CreateBudgetItemDto) {
    return this.budgetItemsModel.create({
      ...createBudgetItemDto,
      accountId: this.tenantService.tenant.id,
    });
  }

  findAll(
    budgetId?: string | undefined | null,
    patientId?: string | undefined | null,
  ) {
    console.log('patientId', patientId, Budget.tableName);
    return this.budgetItemsModel.findAll({
      include: [
        {
          model: this.treatmentModel,
          attributes: ['id', 'name', 'value', 'specialtyId', 'description'],
        },
        {
          model: this.budgetModel,
          attributes: [
            'description',
            'patient_id',
            'professional_id',
            'status',
          ],
          include: [
            {
              model: this.planModel,
              attributes: ['id', 'name'],
            },
          ],
        },
      ],
      where: {
        accountId: this.tenantService.tenant.id,
        active: true,
        ...(budgetId && { budgetId }),
        ...(patientId && { '$budget.patient_id$': patientId }),
        ...(true && { '$budget.status$': ['A', 'P'] }), // Filtra status Budget com 'A' ou 'P'
      },
      order: [['updated_at', 'DESC']],
    });
  }

  findOne(id: string) {
    return this.budgetItemsModel.findOne({
      where: {
        id,
        accountId: this.tenantService.tenant.id,
      },
    });
  }

  async openBudget(days: number) {
    const daylimit = moment(new Date()).subtract(days, 'days').startOf('day');
    return await this.budgetItemsModel.findAll({
      attributes: [
        [sequelize.fn('sum', sequelize.col('BudgetItem.value')), 'total'],
      ],
      include: [
        {
          model: this.budgetModel,
          attributes: [],
          where: {
            status: StatusEnum.Open,
            accountId: this.tenantService.tenant.id,
            active: true,
            created_at: {
              [Op.gt]: daylimit,
            },
          },
        },
      ],
      raw: true,
    });
  }

  update(id: string, updateBudgetItemDto: UpdateBudgetItemDto) {
    return this.budgetItemsModel.update(updateBudgetItemDto, {
      where: {
        id,
        accountId: this.tenantService.tenant.id,
      },
    });
  }

  remove(id: string) {
    return this.budgetItemsModel.destroy({
      where: {
        id: id,
        accountId: this.tenantService.tenant.id,
      },
    });
  }

  async totalByTreatment(days?: number) {
    const daylimit = moment(new Date()).subtract(days, 'days').startOf('day');
    const sequelize = this.budgetItemsModel.sequelize;

    return this.budgetItemsModel.findAll({
      where: {
        account_id: this.tenantService.tenant.id,
        active: true,
        ...(days && {
          created_at: { [Op.gt]: daylimit },
        }),
      },
      include: [
        {
          model: this.treatmentModel,
          as: 'treatment',
          attributes: [], // Não precisamos trazer separado, pois vamos concatenar
        },
      ],
      attributes: [
        'treatmentId',
        'unit',
        'qtd',
        'session',
        // CONCAT(Treatment.name, ' - ', BudgetItem.description) AS name
        [
          sequelize.literal(
            `CONCAT("treatment"."name", ' - ', "BudgetItem"."description")`,
          ),
          'name',
        ],
        [sequelize.fn('SUM', sequelize.col('BudgetItem.value')), 'sumTotal'],
      ],
      group: [
        'treatmentId',
        'unit',
        'qtd',
        'session',
        'treatment.id',
        'treatment.name',
        'BudgetItem.description',
      ],
    });
  }

  totalBySpecialty() {
    return this.budgetItemsModel.findAll({
      where: {
        account_id: this.tenantService.tenant.id,
        active: true,
        '$budget.status$': 'P',
      },
      include: [
        {
          model: this.budgetModel,
          attributes: ['status'],
          as: 'budget',
        },
        {
          model: this.treatmentModel,
          attributes: ['name', 'specialty_id'],
          as: 'treatment',
        },
      ],
      attributes: [
        [
          this.budgetItemsModel.sequelize.fn(
            'sum',
            this.budgetItemsModel.sequelize.col('BudgetItem.value'),
          ),
          'sumTotal',
        ],
      ],
      group: [
        'budget.id',
        'BudgetItem.value',
        'treatment.specialty_id',
        'treatment.id',
      ],
    });
  }
}
