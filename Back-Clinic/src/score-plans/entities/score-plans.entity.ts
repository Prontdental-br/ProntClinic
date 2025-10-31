/* eslint-disable prettier/prettier */
import {
  Table,
  Column,
  DataType,
  PrimaryKey,
  Model,
} from 'sequelize-typescript';

@Table({
  tableName: 'score_plans',
  createdAt: 'created_at',
  schema: 'general_prontclinic',
  updatedAt: 'updated_at',
})
export class ScorePlans extends Model {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  id: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'number_of_consultations',
  })
  numberOfConsultations: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  value: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    field: 'value_per_consultation',
  })
  valuePerConsultation: number;
}
