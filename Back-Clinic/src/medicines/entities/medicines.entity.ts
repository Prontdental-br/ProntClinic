import {
  Column,
  DataType,
  PrimaryKey,
  Table,
  Model,
} from 'sequelize-typescript';

@Table({
  tableName: 'medicines',
  createdAt: 'created_at',
  schema: 'general_prontclinic',
  updatedAt: 'updated_at',
})
export class Medicines extends Model {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  id: string;

  @Column({
    field: 'search_value',
  })
  searchValue: string;

  @Column({
    field: 'data',
    type: DataType.JSONB,
    allowNull: true,
  })
  data!: JSON;

  @Column({
    field: 'updated_at',
  })
  updatedAt: Date;
}
