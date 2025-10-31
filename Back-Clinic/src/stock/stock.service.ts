import { Injectable, Scope } from '@nestjs/common';
import { Stock } from './entities/stock.entity';
import { TenantService } from 'src/tenant/tenant/tenant.service';
import { TenantModel } from 'src/common/decorators/tenant.decorators';
import { TenantModelService } from 'src/tenant/tenant/tenant.serviceModel';
import { LogsSystem } from 'src/logs-system/entities/logs-system.entity';

@Injectable({ scope: Scope.REQUEST })
export class StockService {
  constructor(
    private tenantService: TenantService,
    private tenantModelService: TenantModelService,
  ) {}

  @TenantModel(Stock)
  private readonly stockModel: typeof Stock;

  @TenantModel(LogsSystem)
  private readonly logsSystemModel: typeof LogsSystem;

  async findAll() {
    return this.stockModel.findAll({
      where: {
        accountId: this.tenantService.tenant.id,
        active:true,
      },
    });
  }

  async create(stockFields) {
    const accountId = this.tenantService.tenant.id;
    const userId = this.tenantService.userTenant.id;

    const stock = await this.stockModel.create({
      ...stockFields,
      expiryDate: new Date(stockFields.expiryDate),
      manufactureDate: new Date(stockFields.manufactureDate),
      accountId,
    });

    await this.logsSystemModel.create({
      accountId,
      userId,
      referenceId: stock.id,
      type: 'stock',
      description: `Inclusão registro - Quantidade em Estoque: ${stock.quantity}`,
      created_at: new Date(),
    });

    return stock;
  }

  async update(id: string, stockFields) {
    return this.stockModel.update(
      {
        ...stockFields,
        expiryDate: new Date(stockFields.expiryDate),
        manufactureDate: new Date(stockFields.manufactureDate),
      },
      {
        where: {
          id: id,
          accountId: this.tenantService.tenant.id,
        },
      },
    );
  }

  async withdrawal(params) {
    const { id, quantity } = params;
    const accountId = this.tenantService.tenant.id;
    const userId = this.tenantService.userTenant.id;

    const [affectedCount] = await this.stockModel.update(
      { quantity: this.stockModel.sequelize.literal(`quantity - ${quantity}`) },
      { where: { id, accountId } },
    );

    if (affectedCount > 0) {
      await this.logsSystemModel.create({
        accountId,
        userId,
        referenceId: id,
        type: 'stock',
        description: `Quantidade retirada: ${quantity}`,
        created_at: new Date(),
      });
    }

    return { affectedCount };
  }

  async add(params) {
    const { id, quantity } = params;
    const accountId = this.tenantService.tenant.id;
    const userId = this.tenantService.userTenant.id;

    const [affectedCount] = await this.stockModel.update(
      { quantity: this.stockModel.sequelize.literal(`quantity + ${quantity}`) }, 
      { where: { id, accountId } },
    );

    if (affectedCount > 0) {
      await this.logsSystemModel.create({
        accountId,
        userId,
        referenceId: id,
        type: 'stock',
        description: `Quantidade adicionada: ${quantity}`,
        created_at: new Date(),
      });
    }

    return { affectedCount };
  }

  async remove(id: string) {
    await this.stockModel.update(
      { active: false },
      {
        where: {
          id,
          accountId: this.tenantService.tenant.id,
        },
      },
    );

    await this.logsSystemModel.create({
      accountId: this.tenantService.tenant.id,
      userId: this.tenantService.userTenant.id,
      referenceId: id,
      type: 'stock',
      description: 'Registro excluído',
      created_at: new Date(),
    });

    return { success: true };
  }
}
