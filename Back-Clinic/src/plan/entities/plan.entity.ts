import { Column, Table } from 'sequelize-typescript';
import { ModelBase } from 'src/base/entities/ModelBase';

@Table({
  tableName: 'plans',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})
export class Plan extends ModelBase {
  @Column({ allowNull: false })
  name: string;

  @Column
  specialty: string;

  @Column({ allowNull: true, defaultValue: true })
  active: boolean;
}
