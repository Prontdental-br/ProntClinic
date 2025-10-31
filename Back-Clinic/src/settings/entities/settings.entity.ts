import { Model, Column, Table } from 'sequelize-typescript';

@Table({
  tableName: 'settings',
  schema: 'general_prontclinic',
  timestamps: false,
})
export class Settings extends Model {
  @Column({
    primaryKey: true,
  })
  name: string;

  @Column
  value: string;
}
