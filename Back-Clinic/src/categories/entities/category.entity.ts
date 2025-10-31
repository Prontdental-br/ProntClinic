import {
  Table,
  Column,
  DataType,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript';
import { ModelBase } from 'src/base/entities/ModelBase';

@Table({ tableName: 'categories', timestamps: true })
export class StatusLog extends ModelBase {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string;

  @Column({ type: DataType.UUID, allowNull: true, field: 'user_created' })
  userCreated: string;

  @Column({ type: DataType.UUID, allowNull: true, field: 'user_updated' })
  userUpdated: string;

  @CreatedAt
  @Column({ field: 'created_at' })
  createdAt: Date;

  @UpdatedAt
  @Column({ field: 'updated_at' })
  updatedAt: Date;
}
