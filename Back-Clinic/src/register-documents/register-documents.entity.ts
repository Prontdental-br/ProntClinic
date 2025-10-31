import {
  Table,
  Column,
  DataType,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript';
import { ModelBase } from 'src/base/entities/ModelBase';

@Table({
  tableName: 'register_documents',
  timestamps: true,
})
export class RegisterDocument extends ModelBase {

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  title: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  description: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  description1: string;

  @Column({
    allowNull: false,
  })
  type: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true
  })
  active: boolean;

  @Column({
    type: DataType.UUID,
    allowNull: true,
    field: 'user_created',
  })
  userCreated: string;

  @Column({
    type: DataType.UUID,
    allowNull: true,
    field: 'user_updated',
  })
  userUpdated: string;

  @CreatedAt
  @Column({ field: 'created_at' })
  createdAt: Date;

  @UpdatedAt
  @Column({ field: 'updated_at' })
  updatedAt: Date;
}
