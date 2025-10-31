/* eslint-disable prettier/prettier */
import { Table, Column, DataType } from 'sequelize-typescript';

import { ModelBase } from 'src/base/entities/ModelBase';

@Table({
  tableName: 'prosthesis_labels',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})
export class ProsthesisLabel extends ModelBase {
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
