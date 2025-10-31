/* eslint-disable prettier/prettier */
import {
  Table,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { ModelBase } from 'src/base/entities/ModelBase';
import { AnamneseConfig } from './anamnese-config.entity';

@Table({
  tableName: 'anamnese_config_itens',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})
export class AnamneseConfigItem extends ModelBase {
  @ForeignKey(() => AnamneseConfig)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'anamnese_config_id',
  })
  anamneseConfigId: string;

  @BelongsTo(() => AnamneseConfig)
  config: AnamneseConfig;

  @Column(DataType.INTEGER)
  seq: number;

  @Column(DataType.STRING)
  question: string;

  @Column(DataType.JSONB)
  options: any;

  @Column({ type: DataType.STRING, allowNull: true, field: 'question_type' })
  questionType: string;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  required: boolean;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  alert: boolean;

  @Column({ type: DataType.UUID, allowNull: true, field: 'user_created' })
  userCreated: string;

  @Column({ type: DataType.UUID, allowNull: true, field: 'user_updated' })
  userUpdated: string;
}
