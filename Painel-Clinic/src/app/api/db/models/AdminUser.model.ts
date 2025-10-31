import { Model, Table, Column, DataType, PrimaryKey } from 'sequelize-typescript'

@Table({
  tableName: 'admin_users',
  createdAt: 'created_at',
  schema: 'general_prontclinic',
  updatedAt: 'updated_at'
})
export default class AdminUser extends Model {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  id: string

  @Column({
    type: DataType.STRING,
    field: 'name',
    allowNull: true
  })
  name?: string

  @Column({
    type: DataType.STRING,
    field: 'email',
    unique: true,
    allowNull: true
  })
  email?: string

  @Column({
    type: DataType.DATE,
    field: 'email_verified',
    allowNull: true
  })
  emailVerified?: Date

  @Column({
    type: DataType.STRING,
    field: 'image',
    allowNull: true
  })
  image?: string

  @Column({
    type: DataType.STRING,
    field: 'role',
    allowNull: true
  })
  role: string

  @Column({
    type: DataType.STRING,
    field: 'password',
    allowNull: true
  })
  password: string

  @Column({
    type: DataType.STRING,
    field: 'phone',
    allowNull: true
  })
  phone: string

  @Column({
    type: DataType.STRING,
    field: 'gender',
    allowNull: true
  })
  gender: string

  @Column({
    type: DataType.STRING,
    field: 'cpf',
    allowNull: true
  })
  cpf: string
}
