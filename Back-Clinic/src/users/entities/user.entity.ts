import {
  BelongsTo,
  Column,
  DataType,
  HasOne,
  Table,
} from 'sequelize-typescript';
import { Account } from 'src/accounts/entities/account.entity';
import { ModelBase } from 'src/base/entities/ModelBase';
import { Professional } from 'src/professionals/entities/professional.entity';

export enum TypeEnum {
  Master = 'M',
  Operator = 'O',
  Dentist = 'D',
}

@Table({
  tableName: 'users',
  schema: 'general_prontclinic',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})
export class User extends ModelBase {
  @Column({ allowNull: false })
  name: string;

  @Column({ allowNull: false })
  email: string;

  @Column({ allowNull: false })
  password: string;

  @Column({ allowNull: false })
  type: TypeEnum;

  @Column({ allowNull: false, defaultValue: true })
  activated: boolean;

  @BelongsTo(() => Account)
  account: Account;

  @HasOne(() => Professional)
  professional: Professional;

  @Column({
    field: 'schedule_message_text',
    type: DataType.TEXT,
  })
  scheduleMessageText: string;

  @Column({ field: 'active_schedule_message' })
  activeScheduleMessage: string;

  @Column({
    field: 'activate_reminder',
    allowNull: false,
    defaultValue: false,
  })
  activateReminder: boolean;

  @Column({ field: 'active_notification_sound' })
  activeNotificationSound: boolean;

  @Column({ field: 'is_holder' })
  isHolder: boolean;
}
