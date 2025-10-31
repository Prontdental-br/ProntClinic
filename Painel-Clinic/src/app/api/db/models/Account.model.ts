import { Model, Column, Table, PrimaryKey, DataType, Default, HasMany, HasOne } from 'sequelize-typescript'

import User from './User.model'
import { Clinic } from './Clinic.Model'

@Table({
  tableName: 'accounts',
  createdAt: 'created_at',
  schema: 'general_prontclinic',
  updatedAt: 'updated_at'
})
export class Account extends Model {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  id: string

  @Column({ allowNull: false })
  name: string

  @Column({ allowNull: true })
  description: string

  @Column({ allowNull: true, defaultValue: true })
  active: boolean

  @Column({ field: 'consultation_time', defaultValue: 30, allowNull: true })
  consultationTime: number

  @Column({ field: 'cell_phone', allowNull: false })
  cellPhone: string

  @Column({ allowNull: true })
  hourly: string

  @Column({ defaultValue: 'M', allowNull: true })
  type: string

  @Default(0)
  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
  balancer: number

  @HasMany(() => User, 'account_id')
  users: User[]

  @HasOne(() => Clinic)
  clinic: Clinic

  @Column({ field: 'last_session', allowNull: false })
  lastSession: Date

  @Column({
    field: 'expired_subscription',
    allowNull: false,
    defaultValue: false
  })
  expiredSubscription: boolean

  @Column({
    field: 'expires_in',
    allowNull: true
  })
  expiresIn: number

  @Column({
    type: DataType.INTEGER,
    autoIncrement: true
  })
  idSeq: number
}
