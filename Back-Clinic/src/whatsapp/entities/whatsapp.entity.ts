import {
  Column,
  DataType,
  ForeignKey,
  PrimaryKey,
  Table,
  Model,
  AllowNull,
} from 'sequelize-typescript';
import { Col } from 'sequelize/types/utils';
import { Account } from 'src/accounts/entities/account.entity';
import { ModelBase } from 'src/base/entities/ModelBase';

@Table({
  tableName: 'whatsapp_connection',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})
export class Whatsapp extends Model {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  id: string;

  @ForeignKey(() => Account)
  @Column({
    field: 'account_id',
    type: DataType.UUID,
    allowNull: true,
  })
  accountId: string;

  @Column
  token: string;

  @Column({ field: 'chat_connected', defaultValue: false, allowNull: false })
  chatConnected: boolean;

  @Column({ field: 'evolution_instance_id' })
  evolutionInstanceId: string;

  @Column({ field: 'evolution_instance_name' })
  evolutionInstanceName: string;

  @Column({ field: 'is_connected', defaultValue: false, allowNull: false })
  isConnected: boolean;

  @Column({ field: 'phone', allowNull: true })
  phoneNumber: string;

  @Column({ field: 'created_by_admin', defaultValue: false })
  createdByAdmin: boolean;
}
