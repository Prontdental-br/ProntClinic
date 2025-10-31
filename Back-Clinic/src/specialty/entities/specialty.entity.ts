import { Column, Table, HasMany } from 'sequelize-typescript';
import { ModelBase } from 'src/base/entities/ModelBase';
import { Treatment } from 'src/treatments/entities/treatment.entity';

@Table({
  tableName: 'specialties',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})
export class Specialty extends ModelBase {
  @Column({ allowNull: false })
  name: string;

  @Column
  description: string;

  @Column({ defaultValue: false })
  active: boolean;

  @Column({ defaultValue: false })
  deleted: boolean

  @HasMany(() => Treatment)
  treatments: Treatment[];
}
