import { Table, Column, DataType, HasMany } from 'sequelize-typescript';

import { ModelBase } from 'src/base/entities/ModelBase';
import { KanbanTask } from './kanban-task.entity';

@Table({ tableName: 'kanban_columns', timestamps: true })
export class KanbanColumn extends ModelBase {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  title!: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
  })
  order: number;

  @HasMany(() => KanbanTask, { onDelete: 'CASCADE' })
  tasks!: KanbanTask[];
}
