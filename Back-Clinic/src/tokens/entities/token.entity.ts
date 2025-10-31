/* eslint-disable prettier/prettier */
import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { ModelBase } from 'src/base/entities/ModelBase';
import { Budget } from 'src/budgets/entities/budget.entity';
import { User } from 'src/users/entities/user.entity';

@Table({
  tableName: 'token',
  createdAt: 'created_at',
  schema: 'general_prontclinic',
  updatedAt: 'updated_at',
})
export class Token extends Model {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  id: string;

  @BelongsTo(() => User)
  user: User;

  @ForeignKey(() => User)
  @Column({
    field: 'user_id',
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    allowNull: false,
  })
  userId: string;

  @Column
  token: string;
}
