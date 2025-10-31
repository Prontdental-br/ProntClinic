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
  tableName: 'quote_plan',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})
export class QuotePlan extends ModelBase {
  @Column
  quote: number;
}
