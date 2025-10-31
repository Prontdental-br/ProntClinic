/* eslint-disable prettier/prettier */
// anamnese.model.ts
import {
  Table,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
} from 'sequelize-typescript';
import { ModelBase } from 'src/base/entities/ModelBase';
import { AnamneseConfig } from './anamnese-config.entity';
import { AnamneseItem } from './anamnese-item.entity';
import { Patient } from 'src/patients/entities/patient.entity';

@Table({
  tableName: 'anamneses',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})
export class Anamnese extends ModelBase {
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

  @ForeignKey(() => AnamneseConfig)
  @Column({ type: DataType.UUID, allowNull: false, field: 'anamnese_config_id' })
  anamneseConfigId: string;

  @BelongsTo(() => AnamneseConfig)
  config: AnamneseConfig;

  @Column({ type: DataType.DATE, allowNull: true, field: 'date_created' })
  dateCreated: Date;

  @Column({  type: DataType.DATE, allowNull: true, field: 'date_send' })
  dateSend: Date;

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
    field: 'is_signed',
  })
  isSigned: boolean;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    field: 'font_family',
  })
  fontFamily: string;

  @Column({ type: DataType.DATE, allowNull: true, field: 'date_signature' })
  dateSignature: Date;

  @Column({ type: DataType.STRING })
  status: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    defaultValue: '',
  })
  observation: string;

  @Column({ type: DataType.BOOLEAN, defaultValue: false, field: 'current_anamnese' })
  currentAnamnese: boolean;

  @HasMany(() => AnamneseItem)
  items: AnamneseItem[];

  @Column({ type: DataType.UUID, allowNull: true, field: 'user_created' })
  userCreated: string;

  @Column({ type: DataType.UUID, allowNull: true, field: 'user_updated' })
  userUpdated: string;
}
