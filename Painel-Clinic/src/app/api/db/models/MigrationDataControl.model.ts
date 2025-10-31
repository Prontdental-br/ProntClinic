import {
  Table,
  Column,
  DataType,
  Model,
  PrimaryKey,
  Default,
} from 'sequelize-typescript';

@Table({
  tableName: 'migration_data_controls',
  schema: 'db_import_clinicorp',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})
export class MigrationDataControl extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({
    type: DataType.UUID,
  })
  id: string;

  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'account_id',
  })
  accountId: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  status: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    field: 'status_diagnostic',
    defaultValue: null,
  })
  statusDiagnostic: string | null;

  @Default(DataType.NOW)
  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'created_at',
  })
  createdAt: Date;

  @Default(DataType.NOW)
  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'updated_at',
  })
  updatedAt: Date;

  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'created_user_id',
  })
  createdUserId: string;

  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'updated_user_id',
  })
  updatedUserId: string;
}
