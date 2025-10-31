import { Injectable, Scope } from '@nestjs/common';
import { CreateContractConfigDto } from './dto/create-contract-config.dto';
import { UpdateContractConfigDto } from './dto/update-contract-config.dto';
import { TenantModel } from 'src/common/decorators/tenant.decorators';
import { ContractConfig } from './entities/contract-config.entity';
import { TenantModelService } from 'src/tenant/tenant/tenant.serviceModel';
import { TenantService } from 'src/tenant/tenant/tenant.service';

@Injectable({ scope: Scope.REQUEST })
export class ContractConfigsService {
    constructor(
      private tenantService: TenantService,
      private tenantModelService: TenantModelService,
    ) {}

  @TenantModel(ContractConfig)
  private readonly contractConfigModel: typeof ContractConfig;

  create(createContractConfigDto: CreateContractConfigDto) {
    return this.contractConfigModel.create({
      ...createContractConfigDto,
      accountId: this.tenantService.tenant.id,
      userCreated: this.tenantService.userTenant.id,
    });
  }

  async findAll() {

    const contracts = await this.contractConfigModel.findAll({
      where: {
        accountId: this.tenantService.tenant.id,
      },
      order: [['createdAt', 'DESC']], 
    });

    return contracts;
  }

  findOne(id: string) {
    return this.contractConfigModel.findByPk(id);
  }

  update(id: string, updateContractConfigDto: UpdateContractConfigDto) {
    return this.contractConfigModel.update(
      {
        ...updateContractConfigDto,
        userUpdated: this.tenantService.userTenant.id,
      },
      { where: { id, accountId: this.tenantService.tenant.id } },
    );
  }

  remove(id: string) {
    return this.contractConfigModel.destroy({
      where: { id, accountId: this.tenantService.tenant.id },
    });
  }
}
