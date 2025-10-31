/* eslint-disable prettier/prettier */
import { Table, Column, DataType, HasMany } from 'sequelize-typescript';

import { ModelBase } from 'src/base/entities/ModelBase';
import { ProsthesisTask } from './prosthesis-tasks.entity';

@Table({ tableName: 'prosthesis_columns', createdAt: 'created_at', updatedAt: 'updated_at' })
export class ProsthesisColumn extends ModelBase {
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

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  color: string

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false, 
  })
  default: boolean

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true, 
  })
  editable!: boolean;

  @HasMany(() => ProsthesisTask, { onDelete: 'CASCADE' })
  tasks!: ProsthesisTask[];
}
