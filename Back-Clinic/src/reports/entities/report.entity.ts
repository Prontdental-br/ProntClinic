import {
  Column,
  Table,
  DataType,
  BelongsTo,
  ForeignKey,
} from 'sequelize-typescript';
import { ModelBase } from 'src/base/entities/ModelBase';
import { Financials } from 'src/financial/entities/financial.entity';

export type transactionType = 'revenue' | 'expense' | 'paid' | 'all';
export type periodtype = 'month' | 'week' | 'year' | 'all';

@Table({
  tableName: 'reports',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})
export class Report extends ModelBase {
  @Column({ allowNull: false })
  name: string;

  @Column
  description: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'start_date',
  })
  startDate: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'end_date',
  })
  endDate: Date;

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
  })
  total: number;

  @Column
  period: periodtype;

  @Column({
    field: 'transaction_type',
  })
  transactionType: string;

  @BelongsTo(() => Financials)
  financial: Financials;

  @ForeignKey(() => Financials)
  @Column({
    field: 'financial_id',
    type: DataType.UUID,
    allowNull: true,
  })
  financialId: string;
}
