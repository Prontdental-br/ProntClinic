import { BelongsTo, Column, DataType, ForeignKey, Model, PrimaryKey, Table } from 'sequelize-typescript'

import { Account } from './Account.model'

export enum TypeEnum {
  Master = 'M',
  Operator = 'O'
}

@Table({
  tableName: 'users',
  createdAt: 'created_at',
  schema: 'general_prontclinic',
  updatedAt: 'updated_at'
})
export default class User extends Model {
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

  @Column({ allowNull: false })
  name: string

  @Column({ allowNull: false })
  email: string

  @Column({ allowNull: false })
  password: string

  @Column({ allowNull: false })
  type: TypeEnum

  @Column({ allowNull: false, defaultValue: true })
  activated: boolean

  @BelongsTo(() => Account)
  account: Account
}
