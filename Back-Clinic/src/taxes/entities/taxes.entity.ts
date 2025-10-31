import { Column, DataType, Table } from 'sequelize-typescript';
import { ModelBase } from 'src/base/entities/ModelBase';

@Table({
  tableName: 'taxes',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})
export class Taxes extends ModelBase {
  @Column({ allowNull: false, type: DataType.INTEGER })
  installment: number;

  @Column({
    field: 'percent_value',
    allowNull: false,
    type: DataType.DECIMAL(10, 2),
  })
  percentValue: number;
}
