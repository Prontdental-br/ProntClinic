import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Table,
} from 'sequelize-typescript';
import { ModelBase } from 'src/base/entities/ModelBase';
import { Patient } from 'src/patients/entities/patient.entity';

@Table({
  tableName: 'sales',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})
export class Sales extends ModelBase {
  @BelongsTo(() => Patient)
  patient: Patient;

  @ForeignKey(() => Patient)
  @Column({
    field: 'patient_id',
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    allowNull: false,
  })
  patientId: string;

  @Column
  title: string;

  @Column
  description: string;

  @Column
  value: number;

  @Column
  status: string;

  @Column({
    field: 'history',
    type: DataType.JSONB,
    allowNull: true,
  })
  history!: JSON;
}
