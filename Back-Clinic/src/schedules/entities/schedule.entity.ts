/* eslint-disable prettier/prettier */
import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Table,
} from 'sequelize-typescript';
import { ModelBase } from 'src/base/entities/ModelBase';
import { Patient } from 'src/patients/entities/patient.entity';
import { Professional } from 'src/professionals/entities/professional.entity';
import { ScheduleTag } from './schedule.tag.entity';
import { DateTime } from 'luxon';

export enum StatusEnum {
  Scheduled = 'SC', //  Scheduled
  CanceledPatient = 'CP', // Canceled by Patient
  CanceledProfessional = 'CS', // Canceled by Professional
  ArrivedPatient = 'AP', // Arrived by Patient
  Confirmed = 'CF', // Confirmed
  Missed = 'MS', // Missed
  Attended = 'AT', // Attended,
  inService = 'IS', // In service,
  Commitment = 'CT' // Commitment
}

@Table({
  tableName: 'schedules',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})
export class Schedule extends ModelBase {
  @Column
  type: string;

  @Column({ field: 'start_date', type: DataType.DATE, allowNull: false })
  startDate: DateTime;

  @Column({ field: 'end_date', type: DataType.DATE, allowNull: false })
  endDate: DateTime;

  @Column
  duration: number;

  @Column({ type: DataType.TEXT, allowNull: true })
  observation: string;

  @Column({ type: DataType.TEXT, allowNull: true, field: 'observation_CRC' })
  observationCRC: string;

  @Column({
    field: 'confirm_message',
    type: DataType.TEXT,
  })
  confirmMessage: string;

  @Column({ field: 'is_confirmed', defaultValue: false })
  isConfirmed: boolean;

  @Column({ field: 'is_all_day', defaultValue: false })
  isAllDay: boolean;

  @Column({ defaultValue: 'C' })
  status: StatusEnum;

  @Column({ field: 'return_in' })
  returnIn: number;

  @ForeignKey(() => Patient)
  @Column({
    field: 'patient_id',
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    allowNull: false,
  })
  patientId: string;

  @BelongsTo(() => Patient)
  patient: Patient;

  @ForeignKey(() => Professional)
  @Column({
    field: 'professional_id',
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    allowNull: false,
  })
  professionalId: string;

  @Column({
    field: 'treatment_id',
    allowNull: true,
    type: DataType.UUID
  })
  treatmentId: string;

  @BelongsTo(() => Professional)
  professional: Professional;

  @HasMany(() => ScheduleTag)
  tags: ScheduleTag[];
}
