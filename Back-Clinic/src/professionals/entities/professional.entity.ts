import { BelongsTo, Column, ForeignKey, Table } from 'sequelize-typescript';
import { ModelBase } from 'src/base/entities/ModelBase';
import { DataType } from 'sequelize-typescript';
import { User } from 'src/users/entities/user.entity';

@Table({
  tableName: 'professionals',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})
export class Professional extends ModelBase {
  @Column({ allowNull: false })
  name: string;

  @Column
  specialty: string;

  @Column
  email: string;

  @Column
  gender: string;

  @Column
  phone: string;

  @Column
  cro: string;

  @Column({
    field: 'signature_pic',
    allowNull: true
  })
  signaturePic: string;

  @Column({
    field: 'type_cr',
  })
  typeCr: string;

  @Column({
    field: 'is_admin',
  })
  isAdmin: boolean;

  @Column({
    field: 'is_private',
  })
  isPrivate: boolean;

  @Column
  cpf: string;

  @BelongsTo(() => User)
  user: User;

  @ForeignKey(() => User)
  @Column({
    field: 'user_id',
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    allowNull: false,
  })
  userId: string;

  @Column({
    field: 'commission_value',
  })
  commissionValue: number;

  @Column({
    field: 'commission_type',
  })
  commissionType: string;

  @Column({
    field: 'commission_when',
  })
  commissionWhen: string;

  @Column({ defaultValue: 1 }) 
  active: number;

  @Column({
    field: 'can_access_plans',
    type: DataType.BOOLEAN,
    allowNull: true, // Permite nulo
    defaultValue: false,
  })
  canAccessPlans: boolean | null;
}
