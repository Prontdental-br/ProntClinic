/* eslint-disable prettier/prettier */
import {
  Table,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';

import { ModelBase } from 'src/base/entities/ModelBase';
import { OpportunityColumn } from './opportunity-columns.entity';

@Table({ tableName: 'opportunity_tasks', createdAt: 'created_at', updatedAt: 'updated_at' })
export class OpportunityTask extends ModelBase {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  title!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  number!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  professional!: string;

  @Column({
    type: DataType.ARRAY(DataType.STRING),
    defaultValue: [],
    field: 'badge_text',
  })
  badgeText!: string[];

  @Column({
    type: DataType.TEXT,
    defaultValue: null,
  })
  comments!: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    field: 'due_date',
  })
  dueDate!: Date;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
  })
  order: number;

  @ForeignKey(() => OpportunityColumn)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'column_id',
  })
  columnId!: string;

  @Column({
    type: DataType.UUID,
    allowNull: true,
    field: 'chat_id',
  })
  chatId: string

  @BelongsTo(() => OpportunityColumn)
  column!: OpportunityColumn;
}
