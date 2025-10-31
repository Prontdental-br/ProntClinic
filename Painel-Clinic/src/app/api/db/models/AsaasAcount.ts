import { BelongsTo, Column, DataType, ForeignKey, Model, PrimaryKey, Table } from 'sequelize-typescript'

import { Account } from './Account.model'

export enum TypeEnum {
  Master = 'M',
  Operator = 'O'
}

@Table({
  tableName: 'asaas_account',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  schema: 'general_prontclinic'
})
export default class AsaasAccount extends Model {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  id: string

  @ForeignKey(() => Account)
  @Column({
    field: 'account_id',
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    allowNull: false
  })
  accountId: string

  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  asaas_account_id: string

  @Column
  asaas_api_key: string

  @Column
  email: string

  @Column
  wallet_id: string

  @Column({ defaultValue: false })
  active: boolean

  @BelongsTo(() => Account)
  account: Account
}
