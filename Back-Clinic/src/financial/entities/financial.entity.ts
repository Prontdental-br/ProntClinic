import { Column, Table } from 'sequelize-typescript';
import { ModelBase } from '../../base/entities/ModelBase';

@Table({
  tableName: 'financials',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
})
export class Financials extends ModelBase {
  @Column({
    field: 'name',
  })
  name: string;

  @Column({
    field: 'phone',
  })
  phone: string;
}
