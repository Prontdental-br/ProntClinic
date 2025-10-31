/* eslint-disable prettier/prettier */
import {
  Table,
  Column,
  DataType,
  HasMany,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript';
import { ModelBase } from 'src/base/entities/ModelBase';
import { Anamnese } from './anamnese.entity';
import { AnamneseConfigItem } from './anamnese-config-item.entity';

@Table({
  tableName: 'anamnese_configs',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})
export class AnamneseConfig extends ModelBase {
  @Column({ type: DataType.STRING  })
  desc: string;

  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  active: boolean;

  @Column({ type: DataType.UUID, allowNull: true, field: 'template_id' })
  templateId: string;

  @HasMany(() => AnamneseConfigItem)
  items: AnamneseConfigItem[];

  @HasMany(() => Anamnese)
  anamneses: Anamnese[];

  @Column({ type: DataType.UUID, allowNull: true, field: 'user_created' })
  userCreated: string;

  @Column({ type: DataType.UUID, allowNull: true, field: 'user_updated' })
  userUpdated: string;
}
