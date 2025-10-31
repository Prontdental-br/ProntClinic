import { Table, Column, DataType, CreatedAt } from 'sequelize-typescript'
import { ModelBase } from 'src/base/entities/ModelBase'

@Table({
  tableName: 'logs_system',
  timestamps: false
})
export class LogsSystem extends ModelBase {
 
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'user_id',
  })
  userId!: string

  @Column({
    type: DataType.UUID,
    allowNull: true,
    field: 'reference_id'
  })
  referenceId?: string

  @Column({
    type: DataType.STRING(50),
    allowNull: false
  })
  type!: string

  @Column({
    type: DataType.STRING(500),
    allowNull: true
  })
  description?: string

  @CreatedAt
  @Column({
    type: DataType.DATE
  })
  created_at!: Date
}
