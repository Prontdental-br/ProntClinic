import { fi } from '@faker-js/faker/.';
import { AllowNull, Column, DataType, Table } from 'sequelize-typescript';
import { ModelBase } from 'src/base/entities/ModelBase';

export enum TypeEnum {
  revenue = 'R',
  expense = 'E',
}

@Table({
  tableName: 'transactions',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})
export class Transaction extends ModelBase {
  @Column
  description: string;

  @Column({ allowNull: false, type: DataType.DECIMAL(10, 2) })
  value: number;

  @Column
  type: TypeEnum;

  @Column({ field: 'data_reference' })
  referenceDate: Date;

  @Column({ field: 'due_date' })
  dueDate: Date;

  @Column({ field: 'is_paid', defaultValue: false })
  isPaid: boolean;

  @Column({ field: 'entity_id' })
  entityId: string;

  @Column
  parent: string;

  @Column({
    field: 'payment_type',
    allowNull: true,
  })
  paymentType: string;

  @Column({
    field: 'payment_method',
    allowNull: true,
  })
  paymentMethod: string;

  @Column({
    field: 'payment_date',
    type: DataType.DATE,
    allowNull: true,
  })
  paymentDate: Date;

  @Column({
    field: 'attachments',
    type: DataType.JSON,
    allowNull: true,
  })
  attachments: string[];

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  active: boolean;

  @Column({
    field: 'is_parent',
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  isParent: boolean;

  @Column({
    field: 'created_at',
    type: DataType.DATE,
  })
  created_at: Date;
}
