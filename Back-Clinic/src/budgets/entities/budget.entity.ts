/* eslint-disable prettier/prettier */
import {
  Column,
  DataType,
  HasMany,
  Table,
  ForeignKey,
  BelongsTo,
  HasOne,
} from 'sequelize-typescript';
import { Col } from 'sequelize/types/utils';
import { ModelBase } from 'src/base/entities/ModelBase';
import { BudgetItem } from 'src/budget-items/entities/budget-item.entity';
import { Patient } from 'src/patients/entities/patient.entity';
import { Payment } from 'src/payment/entities/payment.entity';
import { Plan } from 'src/plan/entities/plan.entity';
import { Professional } from 'src/professionals/entities/professional.entity';

export enum StatusEnum {
  Open = 'O',
  Approved = 'A',
  Rejected = 'R',
  Canceled = 'C',
  Paid = 'P',
}

export enum BudgetType {
  Odontogram = 'odontogram',
  Aesthetics = 'estetica',
}

@Table({
  tableName: 'budgets',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})
export class Budget extends ModelBase {
  @Column
  description: string;

  @Column({
    type: DataType.TEXT,
  })
  observation: string;

  // @Column({
  //   type: DataType.STRING,
  //   allowNull: true,
  // })
  // type: BudgetType;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: true })
  subtotal: number;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: true })
  total: number;

  @Column({
    field: 'down_payment',
    type: DataType.DECIMAL(10, 2),
    allowNull: true,
  })
  downPayment: number;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: true })
  discount: number;

  @Column
  date: string;

  @Column
  installments: number;

  @Column({ defaultValue: 'O' })
  status: StatusEnum;

  @HasMany(() => BudgetItem)
  budgetItems: BudgetItem[];

  @ForeignKey(() => Patient)
  @Column({
    field: 'patient_id',
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    allowNull: false,
    onDelete: 'CASCADE',
  })
  patientId: string;

  @BelongsTo(() => Patient)
  patient: Patient;

  // @HasOne(() => Payment, 'budgetId')
  // payment: Payment;

  @ForeignKey(() => Professional)
  @Column({
    field: 'professional_id',
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    allowNull: false,
  })
  professionalId: string;

  @BelongsTo(() => Professional)
  professional: Professional;

  @ForeignKey(() => Plan)
  @Column({
    field: 'plan_id',
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    allowNull: true,
  })
  planId: string;

  @BelongsTo(() => Plan)
  plan: Plan;

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

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  time: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  hash: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  email: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  name: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  })
  isSigned: boolean;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  fontFamily: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  imgSignature: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  showUnits: boolean;

  @Column({ type: DataType.TEXT, allowNull: true, field: 'observation_CRC' })
  observationCRC: string;

  @Column({
    field: 'down_payment_methods',
    type: DataType.JSONB,
    allowNull: true,
  })
  downPaymentMethods: string[];

  @Column({
    field: 'installments_methods',
    type: DataType.JSONB,
    allowNull: true,
  })
  installmentsMethods: string[];

  @Column({
    field: 'down_payment_installments',
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 1,
  })
  downPaymentInstallments: number;

  @Column({
    field: 'hide_odontogram',
    defaultValue: false,
    allowNull: false,
  })
  hideOdontogram: boolean;

  @Column({
    field: 'budget_paid',
    defaultValue: false,
    allowNull: false,
  })
  budgetPaid: boolean;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  active: boolean;

  @Column({ field: 'created_at' })
  createdAt: Date;

  @Column({ field: 'updated_at' })
  updatedAt: Date;
}
