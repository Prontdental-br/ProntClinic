import { Table, Column, Model, DataType, PrimaryKey, Default } from 'sequelize-typescript'

@Table({
  tableName: 'schemas_references',
  createdAt: 'created_at',
  schema: 'general_prontclinic',
  updatedAt: 'updated_at'
})
export class SchemasReference extends Model<SchemasReference> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({ type: DataType.UUID })
  id: string

  @Column({
    field: 'account_id',
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    allowNull: false
  })
  accountId: string

  @Column({ type: DataType.UUID, allowNull: false })
  id_reference: string

  @Column({ type: DataType.INTEGER, allowNull: false })
  id_schema: number

  @Column({ type: DataType.STRING, allowNull: false })
  type: string

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    field: 'external_references'
  })
  externalReferences: string
}
