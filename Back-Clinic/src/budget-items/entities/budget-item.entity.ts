import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Table,
} from 'sequelize-typescript';
import { Account } from 'src/accounts/entities/account.entity';
import { ModelBase } from 'src/base/entities/ModelBase';
import { Budget } from 'src/budgets/entities/budget.entity';
import { Tooth } from 'src/tooths/entities/tooth.entity';
import { Treatment } from 'src/treatments/entities/treatment.entity';

enum ItemStatus {
  PENDING = 'PENDING',
  FINISHED = 'FINISHED',
}

@Table({
  tableName: 'budget_items',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})
export class BudgetItem extends ModelBase {
  @Column
  description: string;

  @Column({ allowNull: true, type: DataType.DECIMAL(10, 2) })
  value: number;

  // @ForeignKey(() => Plan)
  // @Column({
  //   field: 'plan_id',
  //   type: DataType.UUID,
  //   defaultValue: DataType.UUIDV4,
  //   allowNull: false,
  // })
  // planId: string;
  // @ForeignKey(() => Plan)
  // @Column({
  //   field: 'plan_id',
  //   type: DataType.UUID,
  //   defaultValue: DataType.UUIDV4,
  //   allowNull: false,
  // })
  // planId: string;

  // @BelongsTo(() => Plan)
  // plan: Plan;
  // @BelongsTo(() => Plan)
  // plan: Plan;

  @ForeignKey(() => Account)
  @Column({
    field: 'account_id',
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    allowNull: false,
  })
  accountId: string;

  @ForeignKey(() => Budget)
  @Column({
    field: 'budget_id',
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    allowNull: false,
  })
  budgetId: string;

  @BelongsTo(() => Budget)
  budget: Budget;

  @ForeignKey(() => Treatment)
  @Column({
    field: 'treatment_id',
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    allowNull: true,
  })
  treatmentId: string;

  @BelongsTo(() => Treatment)
  treatment: Treatment;

  @Column({ defaultValue: 'PENDING' })
  status: ItemStatus;

  @Column
  faces: string;

  @Column
  observation: string;

  @Column({
    type: DataType.ENUM('ML', 'UN'),
    allowNull: true,
  })
  unit: 'ML' | 'UN';


  @Column({ allowNull: false, type: DataType.DECIMAL(10, 2), defaultValue: 1 })
  qtd: number;

  @Column({ allowNull: true, type: DataType.INTEGER })
  session: number;

  @Column({ 
    allowNull: false, 
    type: DataType.INTEGER, 
    defaultValue: 0, 
    field: 'session_done' 
  })
  sessionDone: number;

  @Column({ 
    type: DataType.BOOLEAN, 
    defaultValue: true 
  })
  active: boolean;
  
  // @HasMany(() => Tooth)
  // tooths: Tooth[];
}
