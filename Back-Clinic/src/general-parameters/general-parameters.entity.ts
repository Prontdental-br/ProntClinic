/* eslint-disable prettier/prettier */
import { Model } from 'sequelize';
import { Column, DataType, PrimaryKey, Table } from 'sequelize-typescript';

@Table({
  tableName: 'general_parameters',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  schema: 'general_prontclinic',
})
export class GeneralParameters extends Model {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  id: string;

  @Column({
    field: 'on_mode',
  })
  onMode: string;
}
