/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException, Scope } from '@nestjs/common';
import { CreateReturnListDto } from './dto/create-return-list.dto';
import { UpdateReturnListDto } from './dto/update-return-list.dto';
import { TenantService } from 'src/tenant/tenant/tenant.service';
import { TenantModelService } from 'src/tenant/tenant/tenant.serviceModel';
import { TenantModel } from 'src/common/decorators/tenant.decorators';
import { ReturnList } from './entities/return-list.entity';
import { Patient } from 'src/patients/entities/patient.entity';
import { BudgetItem } from 'src/budget-items/entities/budget-item.entity';
import { Treatment } from 'src/treatments/entities/treatment.entity';
import { Sequelize } from 'sequelize';
import { Op } from 'sequelize';

@Injectable({ scope: Scope.REQUEST })
export class ReturnListService {
  constructor(
    private tenantService: TenantService,
    private readonly tenantModelService: TenantModelService,
  ) {}

  @TenantModel(ReturnList)
  private readonly returnListModel: typeof ReturnList;

  @TenantModel(Patient)
  private readonly patientModel: typeof Patient;

  @TenantModel(BudgetItem)
  private readonly budgetItemModel: typeof BudgetItem;

  @TenantModel(Treatment)
  private readonly treatmentModel: typeof Treatment;

  create(createReturnListDto: CreateReturnListDto) {
    return this.returnListModel.create({
      ...createReturnListDto,
      accountId: this.tenantService.tenant.id,
      userCreated: this.tenantService.userTenant.id,
    });
  }

  async findAll(periodo?: string) {
    const today = new Date();
    let startDate: Date;
    let endDate: Date;
    let hasPeriodo = true;

    switch (periodo) {
      case 'day':
        startDate = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
        );
        endDate = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() + 1,
        );
        break;

      case 'week': {
        const firstDayOfWeek = today.getDate() - today.getDay();
        startDate = new Date(
          today.getFullYear(),
          today.getMonth(),
          firstDayOfWeek,
        );
        endDate = new Date(
          today.getFullYear(),
          today.getMonth(),
          firstDayOfWeek + 7,
        );
        break;
      }

      case 'month':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = new Date(
          today.getFullYear(),
          today.getMonth() + 1,
          0,
          23,
          59,
          59,
        );
        break;

      default:
        if (!isNaN(Number(periodo))) {
          const month = Number(periodo) - 1;
          startDate = new Date(today.getFullYear(), month, 1);
          endDate = new Date(today.getFullYear(), month + 1, 0, 23, 59, 59);
        } else {
          // não foi passado periodo
          hasPeriodo = false;
          startDate = new Date(today.getFullYear(), today.getMonth(), 1);
          endDate = new Date(
            today.getFullYear(),
            today.getMonth() + 1,
            0,
            23,
            59,
            59,
          );
        }
        break;
    }

    return this.returnListModel.findAll({
      where: {
        accountId: this.tenantService.tenant.id,
        [Op.or]: [
          {
            status: 'lost',
            ...(hasPeriodo && {
              [Op.and]: [
                Sequelize.where(
                  Sequelize.literal(`
                  CASE 
                    WHEN "return_type" = 'D' THEN "start_date" + ("return_value" * interval '1 day')
                    WHEN "return_type" = 'M' THEN "start_date" + ("return_value" * interval '1 month')
                  END
                `),
                  { [Op.between]: [startDate, endDate] },
                ),
              ],
            }),
          },
          {
            status: 'confirmed',
            ...(hasPeriodo && {
              [Op.and]: [
                Sequelize.where(
                  Sequelize.literal(`
                  CASE 
                    WHEN "return_type" = 'D' THEN "start_date" + ("return_value" * interval '1 day')
                    WHEN "return_type" = 'M' THEN "start_date" + ("return_value" * interval '1 month')
                  END
                `),
                  { [Op.between]: [startDate, endDate] },
                ),
              ],
            }),
          },
          {
            status: 'pending',
            [Op.and]: [
              Sequelize.where(
                Sequelize.literal(`
                CASE 
                  WHEN "return_type" = 'D' THEN "start_date" + ("return_value" * interval '1 day')
                  WHEN "return_type" = 'M' THEN "start_date" + ("return_value" * interval '1 month')
                END
              `),
                { [Op.between]: [startDate, endDate] },
              ),
            ],
          },
        ],
      },
      include: [
        { model: this.patientModel, attributes: ['id', 'name', 'cellPhone'] },
        {
          model: this.budgetItemModel,
          attributes: ['id', 'value'],
          include: [{ model: this.treatmentModel, attributes: ['id', 'name'] }],
        },
      ],
    });
  }

  async findAllPending() {
    return this.returnListModel.findAll({
      where: {
        accountId: this.tenantService.tenant.id,
        status: 'pending',
      },
      include: [
        { model: this.patientModel, attributes: ['id', 'name', 'cellPhone'] },
        {
          model: this.budgetItemModel,
          attributes: ['id', 'value'],
          include: [
            {
              model: this.treatmentModel,
              attributes: ['id', 'name'],
            },
          ],
        },
      ],
    });
  }

  async findOne(id: string) {
    const ret = await this.returnListModel.findByPk(id, {
      include: { all: true },
    });

    if (!ret) throw new NotFoundException('Return not found');
    return ret;
  }

  update(id: string, updateReturnListDto: UpdateReturnListDto) {
    return `This action updates a #${id} returnList`;
  }

  remove(id: string) {
    return `This action removes a #${id} returnList`;
  }

  async updateStatus(id: string, status: 'pending' | 'confirmed' | 'lost') {
    const ret = await this.findOne(id);
    return ret.update({
      status,
      userUpdated: this.tenantService.userTenant.id,
    });
  }
}
