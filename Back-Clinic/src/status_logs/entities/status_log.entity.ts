import {
  Table,
  Column,
  DataType,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript';
import { ModelBase } from 'src/base/entities/ModelBase';

@Table({ tableName: 'status_logs', timestamps: true })
export class StatusLog extends ModelBase {
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'entity_id',
  })
  entityId: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  type: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  status: string;

  @CreatedAt
  @Column({ field: 'created_at' })
  createdAt: Date;

  @UpdatedAt
  @Column({ field: 'updated_at' })
  updatedAt: Date;
}
