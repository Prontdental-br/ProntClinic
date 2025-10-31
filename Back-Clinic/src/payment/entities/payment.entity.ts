import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Table,
} from 'sequelize-typescript';
import { ModelBase } from 'src/base/entities/ModelBase';
import { Budget } from 'src/budgets/entities/budget.entity';

@Table({
  tableName: 'payment',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})
export class Payment extends ModelBase {
  @BelongsTo(() => Budget)
  budget: Budget;

  @ForeignKey(() => Budget)
  @Column({
    field: 'budget_id',
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    allowNull: false,
  })
  budgetId: string;

  @Column({
    field: 'payment_url',
  })
  paymentUrl: string;

  @Column({
    field: 'payment_type',
  })
  paymentType: string;

  @Column({
    field: 'payment_date',
    type: DataType.DATE,
    allowNull: true,
  })
  paymentDate: Date;

  @Column
  value: number;

  @Column
  checkout: string;

  @Column
  observation: string;
}
