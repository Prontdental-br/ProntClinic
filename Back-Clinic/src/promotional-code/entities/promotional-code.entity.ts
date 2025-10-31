import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'promotional_code',
  timestamps: true,
  schema: 'general_prontclinic',
})
export class PromotionalCode extends Model<PromotionalCode> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    allowNull: false,
    primaryKey: true,
  })
  id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  name: string;

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
    validate: {
      min: 0,
    },
  })
  percentage: number;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  validity: Date | null;

  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  sellerId: string | null;
}
