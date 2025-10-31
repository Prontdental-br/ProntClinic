import {
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
} from 'sequelize-typescript';
import { Account } from 'src/accounts/entities/account.entity';

export class ModelBase extends Model {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  id: string;

  @ForeignKey(() => Account)
  @Column({
    field: 'account_id',
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    allowNull: false,
  })
  accountId: string;
}
