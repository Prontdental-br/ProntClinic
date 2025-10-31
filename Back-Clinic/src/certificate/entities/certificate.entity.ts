/* eslint-disable prettier/prettier */
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
  tableName: 'certificate',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})
export class Certificate extends ModelBase {
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
  professional: string;

  @Column
  cid: string;

  @Column
  days: number;

  @Column({
    field: 'start_time',
  })
  startTime: string;

  @Column({
    field: 'end_time',
  })
  endTime: string;

  @Column({
    field: 'start_date',
  })
  startDate: Date;

  @Column({
    field: 'is_declared',
  })
  isDeclared: boolean;

  @Column({
    field: 'school_statement',
    allowNull: true,
  })
  schoolStatement: boolean;

  @Column
  cro: string;

  @Column({
    field: 'type_cr',
  })
  typeCr: string;

  @Column
  speciality: string;

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
