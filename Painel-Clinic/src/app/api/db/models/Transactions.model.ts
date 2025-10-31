import { Column, DataType, Model, PrimaryKey, Table } from 'sequelize-typescript'

export enum TypeEnum {
  revenue = 'R',
  expense = 'E'
}

@Table({
  tableName: 'transactions',
  createdAt: 'created_at',
  updatedAt: 'updated_at'
})
export class Transaction extends Model {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  id: string

  @Column({
    field: 'account_id',
    type: DataType.UUID,
    allowNull: true
  })
  accountId: string

  @Column
  description: string

  @Column({ allowNull: false, type: DataType.DECIMAL(10, 2) })
  value: number

  @Column
  type: TypeEnum

  @Column({ field: 'data_reference' })
  referenceDate: Date

  @Column({ field: 'due_date' })
  dueDate: Date

  @Column({ field: 'is_paid', defaultValue: false })
  isPaid: boolean

  @Column({ field: 'entity_id' })
  entityId: string

  @Column
  parent: string

  @Column({
    field: 'payment_type',
    allowNull: true
  })
  paymentType: string

  @Column({
    field: 'payment_date',
    type: DataType.DATE,
    allowNull: true
  })
  paymentDate: Date

  @Column({
    field: 'is_parent',
    type: DataType.BOOLEAN,
    defaultValue: false
  })
  isParent: boolean
}
