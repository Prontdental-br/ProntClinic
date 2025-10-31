/* eslint-disable prettier/prettier */
// anamnese-item.model.ts
import {
  Table,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { ModelBase } from 'src/base/entities/ModelBase';
import { Anamnese } from './anamnese.entity';

@Table({
  tableName: 'anamnese_itens',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})
export class AnamneseItem extends ModelBase {
  @ForeignKey(() => Anamnese)
  @Column({ type: DataType.UUID, allowNull: false, field: 'anamnese_id' })
  anamneseId: string;

  @BelongsTo(() => Anamnese)
  anamnese: Anamnese;

  @Column({ type: DataType.TEXT, allowNull: true })
  question: string;

  @Column({  type: DataType.TEXT, allowNull: true, field: 'answer_desc' })
  answerDesc: string;

  @Column({ type: DataType.STRING, allowNull: true, field: 'answer_option' })
  answerOption: string;

  @Column(DataType.JSONB)
  options: any;

  @Column({  type: DataType.STRING, allowNull: true, field: 'question_type' })
  questionType: string;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  required: boolean;

  @Column(DataType.INTEGER)
  seq: number;

  @Column({ type: DataType.UUID, allowNull: true, field: 'user_created' })
  userCreated: string;

  @Column({ type: DataType.UUID, allowNull: true, field: 'user_updated' })
  userUpdated: string;
}
