/* eslint-disable prettier/prettier */
import {
  Table,
  Column,
  DataType,
  BelongsTo,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript';
import { Account } from 'src/accounts/entities/account.entity';
import { ModelBase } from 'src/base/entities/ModelBase';

@Table({
  tableName: 'clinics',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})
export class Clinic extends ModelBase {
  @Column
  name: string;

  @Column({
    field: 'profile_pic',
  })
  profilePic: string;

  @Column({
    type: DataType.ENUM,
    values: ['cpf', 'cnpj'],
    field: 'doc_type',
  })
  docType: string;

  @Column({
    field: 'doc_number',
  })
  docNumber: string;

  @Column({
    field: 'communication_name',
  })
  communicationName: string;

  @Column({
    field: 'responsible_name',
  })
  responsibleName: string;

  @Column({
    field: 'open_hour',
    type: DataType.TIME,
  })
  openHour: string;

  @Column({
    field: 'close_hour',
    type: DataType.TIME,
  })
  closeHour: string;

  @Column({
    type: DataType.INTEGER,
    field: 'score_credit',
    allowNull: true,
  })
  scoreCredit: number | null;

  @Column({
    type: DataType.ENUM,
    values: ['clinic', 'professional', 'dentist', 'aesthetic'],
    field: 'emmit_receipt_by',
  })
  emmitReceiptBy: string;

  @Column
  timezone: string;

  @Column
  cep: string;

  @Column
  street: string;

  @Column({
    field: 'address_number',
  })
  addressNumber: string;

  @Column({
    field: 'address_complement',
  })
  addressComplement: string;

  @Column
  neighborhood: string;

  @Column
  city: string;

  @Column
  state: string;

  @Column
  birthday: string;

  @BelongsTo(() => Account)
  account: Account;

  @Column({
    field: 'whatsapp_number',
  })
  whatsappNumber: string;

  @Column({
    field: 'whatsapp_api_url',
  })
  whatsappApiUrl: string;

  @Column({
    field: 'whatsapp_api_token',
  })
  whatsappApiToken: string;

  @Column({
    field: 'calendar_schedule',
    allowNull: true,
  })
  calendarSchedule: string

  @CreatedAt
  @Column({ field: 'created_at' })
  createdAt: Date;

  @UpdatedAt
  @Column({ field: 'updated_at' })
  updatedAt: Date;
}
