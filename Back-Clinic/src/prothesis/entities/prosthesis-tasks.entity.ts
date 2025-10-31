/* eslint-disable prettier/prettier */
import {
  Table,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';

import { ModelBase } from 'src/base/entities/ModelBase';
import { ProsthesisColumn } from './prosthesis-columns.entity';

@Table({ tableName: 'prosthesis_tasks', createdAt: 'created_at', updatedAt: 'updated_at' })
export class ProsthesisTask extends ModelBase {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  title!: string;

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
    type: DataType.DATE,
    allowNull: true,
    field: 'status_date',
  })
  statusDate!: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    field: 'return_date',
  })
  returnDate!: Date;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
  })
  order: number;

  @ForeignKey(() => ProsthesisColumn)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'column_id',
  })
  columnId!: string;

  @BelongsTo(() => ProsthesisColumn)
  column!: ProsthesisColumn;
}
