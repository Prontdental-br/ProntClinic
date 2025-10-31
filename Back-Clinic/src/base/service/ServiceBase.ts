import { Model } from 'sequelize-typescript';
import { ServiceBaseAbstract } from './ServiceBaseAbstract';
import { TenantService } from 'src/tenant/tenant/tenant.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ServiceBase<T extends Model> implements ServiceBaseAbstract<T> {
  constructor(private tenantService: TenantService) {}

  getAll(): Promise<T[]> {
    return this.getAll();
  }
  get(id: string): Promise<T> {
    return this.get(id);
  }
  create(item: T): Promise<T> {
    return this.create(item);
  }
  update(id: string, item: T) {
    this.update(id, item);
  }
}
