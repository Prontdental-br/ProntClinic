/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException, Scope } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { Model, ModelStatic } from 'sequelize-typescript';

@Injectable({ scope: Scope.REQUEST })
export class TenantModelService {
  constructor(private readonly tenantService: TenantService) {}

  getSchemaName(): string {
    const idSeq = this.tenantService.tenant?.idSeq;

    if (!idSeq) throw new NotFoundException('id not found by tenant');

    return `${process.env.NAME_SCHEMA_CLIENT}${idSeq}`;
  }

  getModelForTenant<T extends Model>(model: ModelStatic<T>): ModelStatic<T> {
    const schema = this.getSchemaName();

    return (model as any).schema(schema) as ModelStatic<T>;
  }

  
}
