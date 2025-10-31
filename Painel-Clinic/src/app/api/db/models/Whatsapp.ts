import {
  Column,
  DataType,
  Table,
  Model,
  PrimaryKey,
} from 'sequelize-typescript';

@Table({
  tableName: 'whatsapp_connection',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})
export default class Whatsapp extends Model {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  id: string

  @Column({
    field: 'account_id',
    type: DataType.UUID,
    allowNull: true,
  })
  accountId: string;

  @Column
  token: string;

  @Column({ field: 'evolution_instance_id' })
  evolutionInstanceId: string;

  @Column({ field: 'evolution_instance_name' })
  evolutionInstanceName: string;

  @Column({ field: 'is_connected', defaultValue: false })
  isConnected: boolean;

  @Column({ field: 'created_by_admin', defaultValue: false })
  createdByAdmin: boolean;

  @Column({ field: 'phone', allowNull: true })
  phoneNumber: string;
}
