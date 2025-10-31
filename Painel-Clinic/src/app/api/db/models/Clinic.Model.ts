import { Table, Column, DataType, BelongsTo, PrimaryKey, Model, ForeignKey } from 'sequelize-typescript';

import { Account } from '../models';

@Table({
  tableName: 'clinics',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})
export class Clinic extends Model {
  @PrimaryKey
    @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
    id: string;
  
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
    type: DataType.ENUM,
    values: ['clinic', 'professional', 'dentist'],
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
  birthday: Date;

  @ForeignKey(() => Account)
  @Column({
    field: 'account_id',
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    allowNull: false
  })
  accountId: string


}
