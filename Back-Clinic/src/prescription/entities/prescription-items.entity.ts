import {
  Table,
  Column,
  DataType,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript';
import { ModelBase } from 'src/base/entities/ModelBase';

@Table({
  tableName: 'prescription_items',
  timestamps: true,
})
export class PrescriptionItem extends ModelBase {

  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'prescription_id',
  })
  prescriptionId: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  medicine: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  quantity: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  measure: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  dosage: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  duration: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  observation: string;

  @CreatedAt
  @Column({ field: 'created_at' })
  createdAt: Date;

  @UpdatedAt
  @Column({ field: 'updated_at' })
  updatedAt: Date;
}
