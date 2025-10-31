import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  ForeignKey,
} from 'sequelize-typescript';
import { ModelBase } from 'src/base/entities/ModelBase';

@Table({
  tableName: 'contract_configs',
})
export class ContractConfig extends ModelBase {

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  title: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  content: string;

  @Default(DataType.NOW)
  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'created_at',
  })
  createdAt!: Date;

  @Default(DataType.NOW)
  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'updated_at',
  })
  updatedAt!: Date;

  @Column({ 
    type: DataType.UUID, 
    allowNull: true, 
    field: 'user_created' 
  })
  userCreated: string;

  @Column({ 
    type: DataType.UUID, 
    allowNull: true, 
    field: 'user_updated' 
})
  userUpdated: string;
}
