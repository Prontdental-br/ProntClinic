import {
  Column,
  DataType,
  Table,
  BelongsTo,
  ForeignKey,
} from 'sequelize-typescript';
import { ModelBase } from 'src/base/entities/ModelBase';
import { Specialty } from 'src/specialty/entities/specialty.entity';

@Table({
  tableName: 'treatments',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})
export class Treatment extends ModelBase {
  @Column
  name: string;

  @Column
  description: string;

  @Column({ allowNull: false, type: DataType.DECIMAL(10, 2) })
  value: number;

  @Column({ defaultValue: true })
  active: boolean;

  @BelongsTo(() => Specialty)
  specialty: Specialty;

  @ForeignKey(() => Specialty)
  @Column({
    field: 'specialty_id',
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    allowNull: false,
  })
  specialtyId: string;

  @Column({ allowNull: true, type: DataType.DECIMAL(10, 2) })
  cost: number;

  @Column
  contraindications: string;

  @Column({
    type: DataType.ENUM,
    values: ['low', 'medium', 'hight'],
  })
  complexity: string;

  @Column({ defaultValue: false })
  deleted: boolean;
}
