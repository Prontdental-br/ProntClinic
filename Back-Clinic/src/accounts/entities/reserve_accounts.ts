/* eslint-disable prettier/prettier */
import {
  Model,
  Column,
  Table,
  PrimaryKey,
  DataType,
  Default,
  HasMany,
  HasOne,
} from 'sequelize-typescript';
import { ParseNumber } from '../../common/db/parse-number.decorator';
import { TypeEnum, User } from 'src/users/entities/user.entity';
import { Clinic } from 'src/clinics/entities/clinic.entity';
import AsaasAccount from './asaasAcount.entity';

@Table({
  tableName: 'reserve_accounts',
  schema: 'general_prontclinic',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})
export class ReserveAccount extends Model {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  id: string;

  @Column({ allowNull: false })
  name: string;

  @Column({ allowNull: true })
  description: string;

  @Column({ allowNull: true, defaultValue: true })
  active: boolean;

  @Column({ field: 'consultation_time', defaultValue: 30, allowNull: true })
  consultationTime: number;

  @Column({ field: 'cell_phone', allowNull: false })
  cellPhone: string;

  @Column({ allowNull: true })
  hourly: string;

  @Column({ defaultValue: 'M', allowNull: true })
  type: string;

  @Column({ field: 'plan_type', allowNull: true })
  planType: string;

  @Column({
    field: 'expired_subscription',
    allowNull: false,
    defaultValue: false,
  })
  expiredSubscription: boolean;

  @Column({
    field: 'expires_in',
    allowNull: true,
  })
  expiresIn: number;

  @Column({ allowNull: false })
  email: string;

  @Column({ allowNull: false })
  password: string;

  @ParseNumber
  @Default(0)
  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
  balancer: number;

  @Column({ field: 'last_session', allowNull: true })
  lastSession: Date;

  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    field: 'id_seq',
  })
  idSeq: number;
}
