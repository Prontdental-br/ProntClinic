/* eslint-disable prettier/prettier */
import { BelongsTo, Column, DataType, HasMany, Table } from 'sequelize-typescript';
import { ModelBase } from 'src/base/entities/ModelBase';
import { Schedule } from 'src/schedules/entities/schedule.entity';

export enum GenderEnum {
  Male = 'M',
  Female = 'F',
  Other = 'O',
}

export enum CellPhoneTypeEnum {
  Residential = 'R',
  Mobile = 'M',
  Other = 'O',
}

export enum PlanTypeEnum {
  Private = 'P',
  HealthInsurance = 'C',
  Other = 'O',
}

@Table({
  tableName: 'patients',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})
export class Patient extends ModelBase {
  @Column({ allowNull: false })
  name: string;

  @Column({ field: 'birth_date' })
  birthDate: string;

  @Column
  gender: GenderEnum;

  @Column
  cpf: string;

  @Column
  rg: string;

  @Column({ field: 'cell_phone' })
  cellPhone: string;

  @Column({
    field: 'international_phone',
    allowNull: true,
  })
  internationalPhone: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  observation: string;

  @Column({ field: 'plan_type', allowNull: true })
  planType: PlanTypeEnum;

  @Column({ field: 'responsible_name' })
  responsibleName: string;

  @Column({ field: 'responsible_birth_date' })
  responsibleBirthDate: string;

  @Column({ field: 'responsible_rg' })
  responsibleRg: string;

  @Column({ field: 'responsible_cpf' })
  responsibleCpf: string;

  @Column({ field: 'responsible_cell_phone' })
  responsibleCellPhone: string;

  @Column({ field: 'zip_code' })
  zipCode: string;

  @Column
  street: string;

  @Column
  neighborhood: string;

  @Column
  city: string;

  @Column
  state: string;

  @Column
  email: string;

  @Column
  avatar: string;

  @Column({ defaultValue: 1 }) 
  active: number;

 

  @HasMany(() => Schedule, {
    onDelete: 'CASCADE',
    hooks: true,
  })
  schedules!: Schedule[];

  @Column({
    field: 'anamnese',
    type: DataType.JSONB,
    allowNull: true,
  })
  anamnese!: JSON;

  @Column({ 
    field: 'insurance_name', 
    allowNull: true 
  })
  insuranceName: string;

  @Column({ 
    field: 'insurance_number', 
    allowNull: true 
  })
  insuranceNumber: number;

   @Column({
    field: 'current_consultation_forecast',
    type: DataType.TEXT,
    allowNull: true,
  })
  currentConsultationForecast: string;

  @Column({
    field: 'performed_in_this_consultation',
    type: DataType.TEXT,
    allowNull: true,
  })
  performedInThisConsultation: string;

  @Column({
    field: 'next_consultation_forecast',
    type: DataType.TEXT,
    allowNull: true,
  })
  nextConsultationForecast: string;

  @Column({ type: DataType.TEXT, allowNull: true, field: 'observation_CRC' })
  observationCRC: string;
}
