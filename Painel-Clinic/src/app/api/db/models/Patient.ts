import { BelongsTo, Column, DataType, ForeignKey, HasMany, Model, PrimaryKey, Table } from 'sequelize-typescript';

import { Account } from './Account.model';

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
export default class Patient extends Model {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  id: string

  @ForeignKey(() => Account)
  @Column({
    field: 'account_id',
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    allowNull: false,
  })
  accountId: string;

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

  @Column
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

  @Column({
    field: 'anamnese',
    type: DataType.JSONB,
    allowNull: true,
  })
  anamnese!: JSON;
}
