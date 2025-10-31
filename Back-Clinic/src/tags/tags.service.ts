import { Injectable, Scope } from '@nestjs/common';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Tag } from './entities/tag.entity';
import { TenantService } from 'src/tenant/tenant/tenant.service';
import { TenantException } from 'src/tenant/exception/TenantException';
import { Op, Sequelize } from 'sequelize';
import { ScheduleTag } from 'src/schedules/entities/schedule.tag.entity';
import { TenantModel } from 'src/common/decorators/tenant.decorators';
import { TenantModelService } from 'src/tenant/tenant/tenant.serviceModel';

@Injectable({ scope: Scope.REQUEST })
export class TagsService {
  constructor(
    private tenantService: TenantService,
    private readonly tenantModelService: TenantModelService,
  ) {}

  @TenantModel(Tag)
  private readonly tagModel: typeof Tag;

  create(createTagDto: CreateTagDto) {
    return this.tagModel.create({
      ...createTagDto,
      accountId: this.tenantService.tenant.id,
    });
  }

  async findAll() {
    return this.tagModel.findAll({
      where: {
        [Op.and]: [
          {
            [Op.or]: [
              { accountId: this.tenantService.tenant.id },
              { accountId: null },
            ],
          },
          { active: true },
        ],
      },
      order: [[Sequelize.fn('unaccent', Sequelize.col('name')), 'ASC']],
    });
  }

  findOne(id: string) {
    return this.tagModel.findOne({
      where: {
        id,
        accountId: this.tenantService.tenant.id,
      },
      rejectOnEmpty: true,
    });
  }

  update(id: string, updateTagDto: UpdateTagDto) {
    return this.tagModel.update(
      {
        ...updateTagDto,
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
    return this.tagModel.update(
      { active: false },
      {
        where: {
          id: id,
          accountId: this.tenantService.tenant.id,
        },
      },
    );
  }
}
