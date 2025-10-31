import { Table, Column, DataType } from 'sequelize-typescript';

import { ModelBase } from 'src/base/entities/ModelBase';

@Table({ tableName: 'kanban_labels' })
export class KanbanLabel extends ModelBase {
  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  name: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  color: string;
}
