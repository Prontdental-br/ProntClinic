import { Column, Table } from 'sequelize-typescript';
import { ModelBase } from 'src/base/entities/ModelBase';

@Table({
  tableName: 'cashs',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})
export class Cash extends ModelBase {
  @Column({ allowNull: false })
  name: string;

  @Column
  description: string;

  @Column({ defaultValue: false })
  active: boolean;

  @Column({ defaultValue: false })
  default: boolean;
}
