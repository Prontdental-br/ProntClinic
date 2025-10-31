import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { Schedule } from './schedule.entity';
import { Tag } from 'src/tags/entities/tag.entity';

@Table({
  tableName: 'schedules_tags',
  timestamps: false,
})
export class ScheduleTag extends Model {
  @ForeignKey(() => Schedule)
  @PrimaryKey
  @Column({
    field: 'schedule_id',
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    allowNull: false,
  })
  scheduleId: string;

  @BelongsTo(() => Schedule)
  schedule: Schedule;

  @ForeignKey(() => Tag)
  @PrimaryKey
  @Column({
    field: 'tag_id',
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    allowNull: false,
  })
  tagId: string;

  @BelongsTo(() => Tag)
  tag: Tag;
}
