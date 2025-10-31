import {
  Column,
  DataType,
  HasMany,
  Table,
  ForeignKey,
  BelongsTo,
  HasOne,
  Model,
  PrimaryKey,
} from 'sequelize-typescript';

import Patient from './Patient';
import { Account } from './Account.model';

export enum StatusEnum {
  Open = 'O',
  Approved = 'A',
  Rejected = 'R',
}

@Table({
  tableName: 'budgets',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})
export default class Budget extends Model {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  id: string

  @Column
  description: string;

  @Column
  observation: string;

  @Column
  subtotal: number;

  @Column
  total: number;

  @Column
  date: string;

  @Column
  installments: number;

  @Column({ field: 'down_payment' })
  downPayment: number;

  @Column
  discount: number;

  @Column({ defaultValue: 'O' })
  status: StatusEnum;

  @ForeignKey(() => Account)
  @Column({
    field: 'account_id',
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    allowNull: false,
  })
  accountId: string;

  @ForeignKey(() => Patient)
  @Column({
    field: 'patient_id',
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    allowNull: false,
    onDelete: 'CASCADE',
  })
  patientId: string;

  @Column({
    field: 'professional_id',
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    allowNull: false,
  })
  professionalId: string;

  @Column({
    field: 'plan_id',
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    allowNull: false,
  })
  planId: string;

  @Column({
    field: 'shapes_tab_regiao',
    type: DataType.JSONB,
    allowNull: true,
  })
  shapesTabRegiao: JSON;

  @Column({
    field: 'shapes_tab_ai',
    type: DataType.JSONB,
    allowNull: true,
  })
  shapesTabAi: JSON;

  @Column({
    field: 'image_captured',
    type: DataType.STRING,
  })
  imageCaptured: string;

  @BelongsTo(() => Patient)
  patient: Patient;
}
