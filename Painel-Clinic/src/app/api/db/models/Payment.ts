import { BelongsTo, Column, DataType, ForeignKey, Model, PrimaryKey, Table } from 'sequelize-typescript'

import Budget from './Budget'
import { Account } from './Account.model';

@Table({
  tableName: 'payment',
  createdAt: 'created_at',
  updatedAt: 'updated_at'
})
export class Payment extends Model {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  id: string;

  @ForeignKey(() => Account)
  @Column({
    field: 'account_id',
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    allowNull: false,
  })
  accountId: string;

  @BelongsTo(() => Budget)
  budget: Budget

  @ForeignKey(() => Budget)
  @Column({
    field: 'budget_id',
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    allowNull: false
  })
  budgetId: string

  @Column({
    field: 'payment_url'
  })
  paymentUrl: string

  @Column({
    field: 'payment_type'
  })
  paymentType: string

  @Column({
    field: 'payment_date',
    type: DataType.DATE,
    allowNull: true,
  })
  paymentDate: Date;

  @Column
  value: number

  @Column
  checkout: string

  @Column
  observation: string
}
