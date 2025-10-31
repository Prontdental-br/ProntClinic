import {
  Table,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { KanbanColumn } from './kanban-column.entity';
import { ModelBase } from 'src/base/entities/ModelBase';

@Table({ tableName: 'kanban_tasks', timestamps: true })
export class KanbanTask extends ModelBase {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  title!: string;

  @Column({
    type: DataType.ARRAY(DataType.STRING),
    defaultValue: [],
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
  })
  dueDate!: Date;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
  })
  order: number;

  @ForeignKey(() => KanbanColumn)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  columnId!: string;

  @BelongsTo(() => KanbanColumn)
  column!: KanbanColumn;
}
