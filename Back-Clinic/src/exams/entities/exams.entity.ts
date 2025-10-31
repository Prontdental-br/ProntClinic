import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Table,
} from 'sequelize-typescript';
import { ModelBase } from '../../base/entities/ModelBase';
import { Patient } from '../../patients/entities/patient.entity';
import { Professional } from 'src/professionals/entities/professional.entity';
import { Labs } from 'src/labs/entities/labs.entity';

@Table({
  tableName: 'lab_exams',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})
export class Exams extends ModelBase {
  @Column({
    field: 'exam_type',
  })
  examType: string;

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

  @BelongsTo(() => Professional)
  professional: Professional;

  @ForeignKey(() => Professional)
  @Column({
    field: 'professional_id',
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    allowNull: false,
  })
  professionalId: string;

  @BelongsTo(() => Labs)
  lab: Labs;

  @ForeignKey(() => Labs)
  @Column({
    field: 'lab_id',
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    allowNull: false,
  })
  labId: string;

  @Column({
    field: 'data',
    type: DataType.JSONB,
    allowNull: true,
  })
  data!: JSON;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  date: Date;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  time: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  hash: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  email: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  name: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  })
  isSigned: boolean;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  fontFamily: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  imgSignature: string;
}
