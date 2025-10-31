import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Table,
} from 'sequelize-typescript';
import { ModelBase } from 'src/base/entities/ModelBase';
import { ScheduleTag } from 'src/schedules/entities/schedule.tag.entity';

@Table({
  tableName: 'tags',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})
export class Tag extends ModelBase {
  @Column({ allowNull: false })
  name: string;

  @Column
  color: string;

  @HasMany(() => ScheduleTag)
  schedules: ScheduleTag[];

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  active: boolean;
}
