import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Table,
} from 'sequelize-typescript';
import { ModelBase } from '../../base/entities/ModelBase';
@Table({
  tableName: 'labs',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})
export class Labs extends ModelBase {
  @Column({
    field: 'name',
  })
  name: string;

  @Column({
    field: 'phone',
  })
  phone: string;
}
